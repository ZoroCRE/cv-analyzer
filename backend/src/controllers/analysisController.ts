import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../utils/supabaseClient';
import { ApiError } from '../utils/ApiError';
import { addJobToQueue } from '../services/queueWorker';
import { logger } from '../utils/logger';

const BUCKET_NAME = process.env.STORAGE_BUCKET || 'cv-uploads';
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit per file
}).array('cvs', 100); // field name is 'cvs', max 100 files

export const uploadCvs = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err: any) => {
        if (err) {
            return next(new ApiError(400, `File upload error: ${err.message}`));
        }

        const user = (req as any).user;
        const files = req.files as Express.Multer.File[];
        
        if (!files || files.length === 0) {
            return next(new ApiError(400, 'No files were uploaded.'));
        }

        const { keyword_list_id, keywords, submission_title } = req.body;
        
        try {
            // 1. Get keywords
            let finalKeywords: string[] = [];
            if (keyword_list_id) {
                const { data: list, error } = await supabaseAdmin
                    .from('keyword_lists')
                    .select('keywords')
                    .eq('id', keyword_list_id)
                    .eq('user_id', user.id)
                    .single();
                if (error || !list) throw new ApiError(404, 'Keyword list not found or access denied.');
                finalKeywords = list.keywords;
            } else if (keywords) {
                finalKeywords = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
            }

            // 2. Create submission record
            const { data: submissionData, error: submissionError } = await supabaseAdmin
                .from('submissions')
                .insert({
                    user_id: user.id,
                    title: submission_title || `Submission on ${new Date().toLocaleDateString()}`,
                    keyword_list_id: keyword_list_id || null,
                    keywords_snapshot: finalKeywords.join(', '),
                    total_files: files.length,
                    status: 'processing'
                })
                .select()
                .single();
            
            if (submissionError) throw new ApiError(500, `Could not create submission: ${submissionError.message}`);
            
            const submissionId = submissionData.id;

            // 3. For each file: upload to storage, create DB record, and enqueue job
            let createdCount = 0;
            for (const file of files) {
                const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                const storagePath = `${user.id}/${submissionId}/${Date.now()}_${sanitizedFilename}`;

                // Upload to Supabase Storage
                const { error: storageError } = await supabaseAdmin.storage
                    .from(BUCKET_NAME)
                    .upload(storagePath, file.buffer, { contentType: file.mimetype });

                if (storageError) {
                    logger.error(`Failed to upload ${file.originalname} to storage: ${storageError.message}`);
                    continue; // Skip this file
                }
                
                // Create cv_analyses record
                const { data: cvAnalysisData, error: dbError } = await supabaseAdmin
                    .from('cv_analyses')
                    .insert({
                        submission_id: submissionId,
                        user_id: user.id,
                        original_filename: file.originalname,
                        storage_path: storagePath,
                        status: 'pending',
                    })
                    .select()
                    .single();

                if (dbError) {
                    logger.error(`Failed to create DB entry for ${file.originalname}: ${dbError.message}`);
                    continue; // Skip this file
                }
                
                // Enqueue job for processing
                await addJobToQueue({
                    cvId: cvAnalysisData.id,
                    userId: user.id,
                    submissionId: submissionId,
                    storagePath: storagePath,
                    keywords: finalKeywords
                });
                createdCount++;
            }
            
            // If some files failed to even be created, update the total count
            if (createdCount < files.length) {
                await supabaseAdmin
                    .from('submissions')
                    .update({ total_files: createdCount, failed_files: files.length - createdCount })
                    .eq('id', submissionId);
            }

            res.status(202).json({
                message: 'Submission accepted and files are being processed.',
                submission: {
                    id: submissionId,
                    status: 'processing',
                    total_files: createdCount,
                },
            });

        } catch (error) {
            next(error);
        }
    });
};