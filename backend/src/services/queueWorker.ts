import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from '../utils/logger';
import { processCvJob } from '../jobs/processCvJob';
import { ProcessCvJobPayload } from '../types';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    logger.error("REDIS_URL is not defined. Queue functionality will be disabled.");
}

const connection = redisUrl ? new IORedis(redisUrl, { maxRetriesPerRequest: null }) : null;

export let analysisQueue: Queue | null = null;
let worker: Worker | null = null;

export function initializeQueue() {
    if (!connection) return;

    // --- Create Queue ---
    analysisQueue = new Queue('cv-analysis-queue', {
        connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: {
                count: 1000, // keep 1000 completed jobs
            },
            removeOnFail: {
                count: 5000, // keep 5000 failed jobs
            },
        },
    });

    // --- Create Worker ---
    const workerConcurrency = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);
    worker = new Worker('cv-analysis-queue', async (job: Job<ProcessCvJobPayload>) => {
        logger.info(`[Worker] Processing job ${job.id} for CV ID: ${job.data.cvId}`);
        await processCvJob(job.data);
    }, { connection, concurrency: workerConcurrency });


    // --- Worker Event Listeners ---
    worker.on('completed', (job: Job, result: any) => {
        logger.info(`[Worker] Job ${job.id} completed successfully.`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
        if (job) {
            logger.error(`[Worker] Job ${job.id} failed with error: ${err.message}`, { stack: err.stack });
        } else {
             logger.error(`[Worker] An unknown job failed with error: ${err.message}`, { stack: err.stack });
        }
    });

     worker.on('error', err => {
        logger.error('[Worker] A worker error occurred:', err);
    });

    logger.info(`🚀 BullMQ Worker started with concurrency: ${workerConcurrency}`);
}

export async function addJobToQueue(payload: ProcessCvJobPayload) {
    if (!analysisQueue) {
        logger.error('Queue not initialized. Cannot add job.');
        // Fallback or throw error. For now, we'll just log.
        // In a real app, you might want a fallback mechanism or to restart the processor.
        throw new Error("Queue service is not available.");
    }
    await analysisQueue.add('process-cv', payload);
    logger.info(`Added job to queue for CV ID: ${payload.cvId}`);
}