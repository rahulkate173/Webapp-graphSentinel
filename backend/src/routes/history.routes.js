import { Router } from 'express';
import { getHistory, getHistoryById } from '../controllers/history.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware.protect);

router.get('/', getHistory);
router.get('/:id', getHistoryById);

export default router;
