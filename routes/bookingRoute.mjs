import express from 'express';
import { protect, restrictTo } from '../controllers/authController.mjs';
import {
    checkOutSession,
    createBookingCheckout,
} from '../controllers/bookingController.mjs';

const router = express.Router();

router.get('/checkout-session/:tourID', protect, checkOutSession);
export default router;
