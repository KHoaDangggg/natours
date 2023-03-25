import express from 'express';
import { isLoggedIn, protect } from '../controllers/authController.mjs';
import { createBookingCheckout } from '../controllers/bookingController.mjs';
import {
    getAccount,
    getLoginForm,
    getMyTours,
    getOverview,
    getTour,
} from '../controllers/viewController.mjs';

const Router = express.Router();

Router.get('/', createBookingCheckout, isLoggedIn, getOverview);
Router.get('/tour/:slug', isLoggedIn, getTour);
Router.get('/login', isLoggedIn, getLoginForm);
Router.get('/me', protect, getAccount);
Router.get('/my-tours', protect, getMyTours);
export default Router;
