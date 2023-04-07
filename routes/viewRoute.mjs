import express from 'express';
import {
    isLoggedIn,
    protect,
    restrictTo,
} from '../controllers/authController.mjs';
import { createBookingCheckout } from '../controllers/bookingController.mjs';
import {
    getAccount,
    getAllUsers,
    getLoginForm,
    getMyTours,
    getOverview,
    getTour,
    getUser,
} from '../controllers/viewController.mjs';

const Router = express.Router();

Router.get('/', createBookingCheckout, isLoggedIn, getOverview);
Router.get('/tour/:slug', isLoggedIn, getTour);
Router.get('/login', getLoginForm);
Router.get('/me', protect, getAccount);
Router.get('/my-tours', protect, getMyTours);
Router.get('/all-users', protect, restrictTo('admin'), getAllUsers);
Router.get('/user/:userId', protect, restrictTo('admin'), getUser);
export default Router;
