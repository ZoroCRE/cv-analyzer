import { Router } from 'express';
import { getKeywordLists, createKeywordList, updateKeywordList, deleteKeywordList } from '../controllers/keywordsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.route('/')
    .get(getKeywordLists)
    .post(createKeywordList);

router.route('/:id')
    .put(updateKeywordList)
    .delete(deleteKeywordList);

export default router;