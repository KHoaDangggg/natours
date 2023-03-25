import express from 'express';

import {
    getAllTours,
    createTour,
    getTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    monthlyPlan,
    getTourWithIn,
    getDistance,
    uploadTourPhoto,
    resizeTourPhoto,
} from '../controllers/tourController.mjs';
import { protect, restrictTo } from '../controllers/authController.mjs';
import reviewRouter from './reviewRoute.mjs';
const router = express.Router();
router
    .route('/monthly-plan/:year')
    .get(protect, restrictTo('admin'), monthlyPlan);
router.route('/tour-stats').get(getTourStats);
router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router
    .route('/tour-within/:distance/center/:latlng/unit/:unit')
    .get(getTourWithIn);
router.route('/distances/:latlng/unit/:unit').get(getDistance);
router
    .route('/')
    .get(getAllTours)
    .post(protect, restrictTo('admin'), createTour);
router.use('/:tourId/reviews', reviewRouter);
router
    .route('/:id')
    .get(getTour)
    .patch(
        protect,
        restrictTo('admin'),
        uploadTourPhoto,
        resizeTourPhoto,
        updateTour
    )
    .delete(protect, restrictTo('admin'), deleteTour);

export default router;
