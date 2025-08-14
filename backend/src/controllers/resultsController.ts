import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient'; // Use user-context client
import { ApiError } from '../utils/ApiError';

// GET all submissions for a user
export const getSubmissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw new ApiError(500, error.message);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// GET details for a single submission, including its CV analyses
export const getSubmissionDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const { submissionId } = req.params;

        const { data: submission, error: submissionError } = await supabase
            .from('submissions')
            .select('*')
            .eq('user_id', user.id)
            .eq('id', submissionId)
            .single();

        if (submissionError) throw new ApiError(404, 'Submission not found or access denied.');
        
        const { data: analyses, error: analysesError } = await supabase
            .from('cv_analyses')
            .select('id, original_filename, final_ats_score, keyword_score, technical_ats_score, status, error_message')
            .eq('submission_id', submissionId);

        if (analysesError) throw new ApiError(500, `Failed to fetch analyses: ${analysesError.message}`);

        res.status(200).json({ submission, results: analyses });
    } catch (error) {
        next(error);
    }
};

// GET full details for a single CV analysis
export const getCvAnalysisDetail = async (req: Request, res: Response, next: NextFunction) => {
     try {
        const user = (req as any).user;
        const { cvId } = req.params;

        const { data, error } = await supabase
            .from('cv_analyses')
            .select(`
                *,
                experiences (*),
                educations (*),
                skills (*)
            `)
            .eq('user_id', user.id)
            .eq('id', cvId)
            .single();

        if (error) throw new ApiError(500, error.message);
        if (!data) throw new ApiError(404, 'CV analysis not found or access denied.');
        
        // As per retention rules, extracted_text and ai_analysis_data might be null.
        // The client should handle this.
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};