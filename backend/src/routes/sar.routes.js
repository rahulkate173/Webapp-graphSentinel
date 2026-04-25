import { Router } from 'express';
import { saveDraft, getDraft, clearDraft } from '../controllers/sar.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint paths:
// GET /api/sar/draft
// POST /api/sar/draft
// DELETE /api/sar/draft

// All SAR draft routes strictly require an authenticated user
router.use(authMiddleware.protect);

router.get('/draft', getDraft);
router.post('/draft', saveDraft);
router.delete('/draft', clearDraft);

export default router;
