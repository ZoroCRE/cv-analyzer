import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabaseClient';
import { ApiError } from '../utils/ApiError';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        
        const { data, error } = await supabaseAdmin.rpc('get_user_dashboard_stats', {
            p_user_id: user.id
        });

        if (error) {
            throw new ApiError(500, `Failed to fetch dashboard stats: ${error.message}`);
        }

        res.status(200).json(data);

    } catch (error) {
        next(error);
    }
};