import { Router } from 'express';
import { getAllUsers, updateUserCredits, reprocessCv } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// Protect all admin routes with auth and admin role checks
router.use(authMiddleware, adminMiddleware);

router.get('/users', getAllUsers);
router.post('/users/:userId/credits', updateUserCredits);
router.post('/reprocess/:cvId', reprocessCv);

export default router;