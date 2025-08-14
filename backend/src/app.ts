import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger, httpLogger } from './utils/logger';

// Import routes
import analysisRoutes from './routes/analysisRoutes';
import resultsRoutes from './routes/resultsRoutes';
import keywordsRoutes from './routes/keywordsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();

// --- Core Middleware ---
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
if (allowedOrigins.length === 0) {
    logger.warn('ALLOWED_ORIGINS is not set. All origins will be blocked by CORS.');
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// --- Logging ---
app.use(httpLogger);

// --- Rate Limiting ---
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
});
app.use(limiter);

// --- API Routes ---
const apiRouter = express.Router();
apiRouter.use('/analysis', analysisRoutes);
apiRouter.use('/results', resultsRoutes);
apiRouter.use('/keywords', keywordsRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/admin', adminRoutes);

app.use('/api', apiRouter);

// --- Health Check ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Error Handling ---
// IMPORTANT: Import and use the error handler LAST
import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);

export default app;