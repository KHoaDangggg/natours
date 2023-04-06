import Tour from '../models/tourModel.mjs';
import catchAsync from '../ultils/catchAsync.mjs';
import appError from '../ultils/appError.mjs';
import Booking from '../models/bookingModel.mjs';
import User from '../models/userModel.mjs';
import apiFeatures from '../ultils/APIFeatures.mjs';
const getOverview = catchAsync(async (req, res) => {
    console.log(req.query);
    //EXECUTE QUERY
    const features = new apiFeatures(Tour.find(), req.query).filter().sort();
    const tours = await features.query;
    //console.log(tours);
    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
    });
});
const getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'review',
        fields: 'review rating user',
    });
    if (!tour) next(new appError('There is no tour with that name', 404));

    res.status(200).render('tour', {
        title: tour.name,
        tour,
    });
});
const getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Login to your acount',
    });
};
const getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your acount',
    });
};

const getMyTours = async (req, res, next) => {
    const bookings = await Booking.find();
    const tourIds = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });
    res.status(200).render('overview', {
        title: 'My tour',
        tours,
    });
};

const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find({});
    res.status(200).render('users', {
        title: 'Manage users',
        users,
    });
});
export {
    getOverview,
    getTour,
    getLoginForm,
    getAccount,
    getMyTours,
    getAllUsers,
};
