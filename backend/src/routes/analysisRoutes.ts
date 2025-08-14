import { Router } from 'express';
import { uploadCvs } from '../controllers/analysisController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All routes in this file are protected
router.use(authMiddleware);

// POST /api/analysis/upload
router.post('/upload', uploadCvs);

export default router;