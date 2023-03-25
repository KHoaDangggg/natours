import express from 'express';
import {
    createReview,
    deleteReview,
    getAllReview,
    getOneReview,
    setTourAndUserID,
    updateReview,
} from '../controllers/reviewController.mjs';
import { protect, restrictTo } from '../controllers/authController.mjs';

const router = express.Router({
    mergeParams: true,
});

//Have to log in to perform action
router.use(protect);
router
    .route('/')
    .get(getAllReview)
    .post(restrictTo('user'), setTourAndUserID, createReview);
router.route('/:id').delete(deleteReview).get(getOneReview).patch(updateReview);

export default router;
