import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabaseClient';
import { ApiError } from '../utils/ApiError';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        if (!user) {
            throw new ApiError(401, 'Authentication required');
        }

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            throw new ApiError(403, 'Forbidden: Profile not found');
        }

        if (profile.role !== 'admin') {
            throw new ApiError(403, 'Forbidden: Admin access required');
        }

        next();
    } catch (error) {
        next(error);
    }
};