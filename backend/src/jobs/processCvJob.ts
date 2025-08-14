import { ProcessCvJobPayload, GeminiResponse } from '../types';
import { supabaseAdmin } from '../utils/supabaseClient';
import { logger } from '../utils/logger';
import { downloadFile, cleanupTempFile } from '../services/storageService';
import { extractTextFromFile } from '../services/ocrService';
import { analyzeCvWithAI } from '../services/aiService';
import { 
    calculateTechnicalATSScore, 
    calculateKeywordMatchScore, 
    calculateFinalATSScore 
} from '../services/scoringService';

const COST_PER_CV = parseInt(process.env.COST_PER_CV || '1', 10);
const RETENTION_FINAL_SCORE_THRESHOLD = parseInt(process.env.RETENTION_FINAL_SCORE_THRESHOLD || '70', 10);
const RETENTION_KEYWORD_SCORE_THRESHOLD = parseInt(process.env.RETENTION_KEYWORD_SCORE_THRESHOLD || '60', 10);

async function updateCvAnalysisStatus(cvId: number, status: 'processing' | 'processed' | 'failed', data: Record<string, any> = {}) {
    await supabaseAdmin.from('cv_analyses').update({ status, ...data }).eq('id', cvId);
}

export async function processCvJob(payload: ProcessCvJobPayload) {
    const { cvId, userId, submissionId, storagePath, keywords } = payload;
    let localPath: string | null = null;

    try {
        await updateCvAnalysisStatus(cvId, 'processing');

        // 1. Decrement user credits
        try {
            const { error: creditError } = await supabaseAdmin.rpc('decrement_credits', {
                p_user_id: userId,
                p_amount: COST_PER_CV,
                p_cv_id: cvId
            });
            if (creditError) throw new Error(creditError.message);
        } catch (error: any) {
            if (error.message.includes('Insufficient credits')) {
                 throw new Error('Insufficient credits to process CV.');
            }
            throw error; // Rethrow other errors
        }

        // 2. Download and Extract Text
        localPath = await downloadFile(storagePath);
        const extractedText = await extractTextFromFile(localPath);
        if (!extractedText || extractedText.length < 50) {
            throw new Error('Failed to extract sufficient text from the document. It might be empty or an image-only PDF without OCR.');
        }

        // 3. AI Analysis & Scoring
        const aiAnalysis: GeminiResponse = await analyzeCvWithAI(extractedText, keywords);
        const technical_ats_score = calculateTechnicalATSScore(extractedText);
        const keyword_score = calculateKeywordMatchScore(aiAnalysis.normalized_tokens, keywords);
        const final_ats_score = calculateFinalATSScore(technical_ats_score, keyword_score);
        
        // 4. Data Retention Logic
        const shouldRetainData = final_ats_score >= RETENTION_FINAL_SCORE_THRESHOLD || keyword_score >= RETENTION_KEYWORD_SCORE_THRESHOLD;

        const updateData: any = {
            candidate_name: aiAnalysis.name,
            candidate_email: aiAnalysis.emails?.[0],
            candidate_phone: aiAnalysis.phones?.[0],
            technical_ats_score,
            keyword_score,
            final_ats_score,
            analysis_completed_at: new Date().toISOString(),
        };

        if (shouldRetainData) {
            logger.info(`[CV ID: ${cvId}] Retention threshold met. Storing full data.`);
            updateData.extracted_text = extractedText;
            updateData.ai_analysis_data = aiAnalysis;
        } else {
            logger.info(`[CV ID: ${cvId}] Retention threshold not met. Storing only scores and metadata.`);
            updateData.extracted_text = null;
            updateData.ai_analysis_data = null;
        }

        // 5. Update Database with results
        const { error: updateError } = await supabaseAdmin
            .from('cv_analyses')
            .update(updateData)
            .eq('id', cvId);
        
        if (updateError) throw new Error(`DB update failed: ${updateError.message}`);

        // If data was retained, insert into structured tables
        if (shouldRetainData && aiAnalysis) {
            if (aiAnalysis.experiences?.length > 0) {
                const experiencesData = aiAnalysis.experiences.map(e => ({ cv_id: cvId, ...e}));
                await supabaseAdmin.from('experiences').insert(experiencesData);
            }
            if (aiAnalysis.educations?.length > 0) {
                const educationsData = aiAnalysis.educations.map(e => ({ cv_id: cvId, ...e}));
                await supabaseAdmin.from('educations').insert(educationsData);
            }
             if (aiAnalysis.skills?.length > 0) {
                const skillsData = aiAnalysis.skills.map(s => ({ cv_id: cvId, name: s }));
                await supabaseAdmin.from('skills').insert(skillsData);
            }
        }

        // 6. Update submission progress
        await supabaseAdmin.rpc('increment_processed_files', { sub_id: submissionId });
        await updateCvAnalysisStatus(cvId, 'processed');
        logger.info(`Successfully processed CV ID: ${cvId}`);

    } catch (error: any) {
        logger.error(`Failed to process CV ID: ${cvId}. Reason: ${error.message}`, { stack: error.stack });
        await updateCvAnalysisStatus(cvId, 'failed', { error_message: error.message });
        await supabaseAdmin.rpc('increment_failed_files', { sub_id: submissionId });

    } finally {
        if (localPath) {
            await cleanupTempFile(localPath);
        }
        // This function will check if all files in a submission are done and update its status
        await supabaseAdmin.rpc('update_submission_status_if_done', { sub_id: submissionId });
    }
}

// NOTE: You'll need to create the helper RPC functions `increment_processed_files`,
// `increment_failed_files`, and `update_submission_status_if_done` in your SQL schema.
// Here's an example of what they might look like to add to your schema.sql:
/*
CREATE OR REPLACE FUNCTION increment_processed_files(sub_id bigint) RETURNS void AS $$
  UPDATE public.submissions SET processed_files = processed_files + 1 WHERE id = sub_id;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION increment_failed_files(sub_id bigint) RETURNS void AS $$
  UPDATE public.submissions SET failed_files = failed_files + 1 WHERE id = sub_id;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION update_submission_status_if_done(sub_id bigint) RETURNS void AS $$
DECLARE
  rec record;
BEGIN
  SELECT * INTO rec FROM public.submissions WHERE id = sub_id;
  IF rec.processed_files + rec.failed_files = rec.total_files THEN
    UPDATE public.submissions SET status = 'completed', updated_at = now() WHERE id = sub_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
*/