import express from 'express';

import {
    deleteMe,
    deleteUser,
    filterUpdateFields,
    getAllUsers,
    getMe,
    getOneUser,
    resizeUserPhoto,
    updateMe,
    uploadUserPhoto,
} from '../controllers/userController.mjs';

import {
    login,
    signup,
    protect,
    forgotPassword,
    resetPassword,
    updatePassword,
    restrictTo,
    logOut,
} from '../controllers/authController.mjs';

const router = express.Router();
//Not have to log in to perform action
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').post(logOut);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);

//Have to log in to perform action
router.use(protect);
router.route('/updatePassword').patch(updatePassword);
router
    .route('/updateMe')
    .post(
        getMe,
        uploadUserPhoto,
        resizeUserPhoto,
        filterUpdateFields,
        updateMe
    );
router.route('/me').get(getMe, getOneUser);
router.route('/deleteMe').delete(deleteMe);

//Restrict role to have permission
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers);
router.route('/:id').delete(deleteUser).get(getOneUser);

export default router;
