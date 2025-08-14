import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Log stack traces
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
  ],
});


// Middleware for logging HTTP requests
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        if (res.statusCode < 400) {
            logger.info(`HTTP ${req.method} ${req.originalUrl} - ${res.statusCode}`);
        } else {
            logger.warn(`HTTP ${req.method} ${req.originalUrl} - ${res.statusCode}`);
        }
    });
    next();
};