import { Router } from 'express';
import { getSubmissions, getSubmissionDetails, getCvAnalysisDetail } from '../controllers/resultsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/submissions', getSubmissions);
router.get('/submission/:submissionId', getSubmissionDetails);
router.get('/cv/:cvId', getCvAnalysisDetail);

export default router;