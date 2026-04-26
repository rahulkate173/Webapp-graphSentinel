import express from 'express';
import { submitPricingInquiry } from '../controllers/pricing.controller.js';

const router = express.Router();

router.post('/', submitPricingInquiry);

export default router;
