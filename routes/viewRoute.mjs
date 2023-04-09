import express from 'express';
import {
    isLoggedIn,
    protect,
    restrictTo,
} from '../controllers/authController.mjs';
import {
    getAccount,
    getAllUsers,
    getLoginForm,
    getMyTours,
    getOverview,
    getSignupForm,
    getTour,
    getUser,
} from '../controllers/viewController.mjs';

const Router = express.Router();

Router.get('/', isLoggedIn, getOverview);
Router.get('/tour/:slug', isLoggedIn, getTour);
Router.get('/login', getLoginForm);
Router.get('/signup', getSignupForm);
Router.get('/me', protect, getAccount);
Router.get('/my-tours', protect, getMyTours);
Router.get('/all-users', protect, restrictTo('admin'), getAllUsers);
Router.get('/user/:userId', protect, restrictTo('admin'), getUser);
export default Router;
