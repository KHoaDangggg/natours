import Review from '../models/reviewModel.mjs';
import catchAsync from '../ultils/catchAsync.mjs';
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './handlerFactory.mjs';

const setTourAndUserID = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};
const getAllReview = getAll(Review);
const createReview = createOne(Review);
const getOneReview = getOne(Review);
const deleteReview = deleteOne(Review);
const updateReview = updateOne(Review);
export {
    getAllReview,
    createReview,
    deleteReview,
    setTourAndUserID,
    getOneReview,
    updateReview,
};
