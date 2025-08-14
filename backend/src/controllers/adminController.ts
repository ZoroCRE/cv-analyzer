import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabaseClient';
import { ApiError } from '../utils/ApiError';
import { addJobToQueue } from '../services/queueWorker';
import { logger } from '../utils/logger';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabaseAdmin.from('profiles').select(`id,full_name,role,credits,created_at,user_info:users(email)`);
        if (error) throw new ApiError(500, error.message);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

export const updateUserCredits = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { amount, reason } = req.body;
        if (typeof amount !== 'number' || !reason) {
            throw new ApiError(400, 'A numeric amount and a reason are required.');
        }
        if (amount < 0) {
             throw new ApiError(400, 'Please use a positive number to add credits.');
        }
        const { data, error } = await supabaseAdmin.rpc('increment_credits', { p_user_id: userId, p_amount: amount, p_reason: reason });
        if (error) throw new ApiError(500, `RPC Error: ${error.message}`);
        res.status(200).json({ success: true, new_balance: data });
    } catch (error) {
        next(error);
    }
};

export const reprocessCv = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cvId } = req.params;

        const { data: cv, error: fetchError } = await supabaseAdmin
            .from('cv_analyses')
            .select(`id, user_id, submission_id, storage_path, submission:submissions(keywords_snapshot)`)
            .eq('id', cvId)
            .single();

        if (fetchError || !cv) {
            throw new ApiError(404, `CV analysis not found. Error: ${fetchError?.message}`);
        }

        const submissionObject = Array.isArray(cv.submission) ? cv.submission[0] : cv.submission;

        if (!submissionObject || typeof submissionObject.keywords_snapshot !== 'string') {
             throw new ApiError(404, 'Could not find parent submission details or keywords.');
        }

        await supabaseAdmin
            .from('cv_analyses')
            .update({ status: 'pending', error_message: null })
            .eq('id', cvId);

        const keywords = submissionObject.keywords_snapshot.split(',').map((k: string) => k.trim());

        await addJobToQueue({
            cvId: cv.id,
            userId: cv.user_id,
            submissionId: cv.submission_id,
            storagePath: cv.storage_path, // <<< THIS IS THE CORRECTED LINE
            keywords: keywords
        });

        logger.info(`[Admin] Re-queued job for CV ID: ${cvId}`);
        res.status(202).json({ message: `CV analysis ${cvId} has been re-queued for processing.` });

    } catch (error) {
        next(error);
    }
};