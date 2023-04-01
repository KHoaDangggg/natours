import express from 'express';
import { protect } from '../controllers/authController.mjs';
import { checkOutSession } from '../controllers/bookingController.mjs';

const router = express.Router();

router.get('/checkout-session/:tourID', protect, checkOutSession);
export default router;
