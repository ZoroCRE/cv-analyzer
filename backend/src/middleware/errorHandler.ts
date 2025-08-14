import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        logger.warn(`API Error: ${err.statusCode} - ${err.message} at ${req.originalUrl}`);
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
    }

    // Handle multer errors specifically if needed
    if (err.name === 'MulterError') {
         logger.warn(`Multer Error: ${err.message}`);
         return res.status(400).json({ success: false, message: `File upload error: ${err.message}` });
    }

    logger.error(`Internal Server Error: ${err.message}`, { stack: err.stack, path: req.originalUrl });
    
    // In production, don't leak stack trace
    const message = process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred.' 
        : err.message;

    return res.status(500).json({
        success: false,
        message: message
    });
};