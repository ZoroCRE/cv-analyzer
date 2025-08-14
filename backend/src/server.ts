import app from './app';
import dotenv from 'dotenv';
import { initializeQueue } from './services/queueWorker';
import { logger } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  // Initialize the queue and start the worker
  initializeQueue();
  logger.info('BullMQ Worker process initialized.');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing http server.');
  server.close(() => {
    logger.info('Http server closed.');
    // Add queue cleanup here if necessary
    process.exit(0);
  });
});