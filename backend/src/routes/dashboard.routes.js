import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware.protect);

router.get('/stats', getDashboardStats);

export default router;
