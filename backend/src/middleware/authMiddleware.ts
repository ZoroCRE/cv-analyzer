import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient';
import { ApiError } from '../utils/ApiError';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'Unauthorized: No token provided');
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new ApiError(401, error?.message || 'Unauthorized: Invalid token');
        }

        // Attach user to the request object
        (req as any).user = user;

        next();
    } catch (error) {
        next(error);
    }
};