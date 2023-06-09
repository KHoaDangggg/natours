import Tour from '../models/tourModel.mjs';
import catchAsync from '../ultils/catchAsync.mjs';
import appError from '../ultils/appError.mjs';
import Booking from '../models/bookingModel.mjs';
import User from '../models/userModel.mjs';
import apiFeatures from '../ultils/APIFeatures.mjs';
const getOverview = catchAsync(async (req, res) => {
    //EXECUTE QUERY
    const features = new apiFeatures(Tour.find(), req.query).filter().sort();
    const tours = await features.query;
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
const getSignupForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Create your own acount',
    });
};
const getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your acount',
    });
};
const getMyTours = async (req, res, next) => {
    const user = req.user._id;
    const bookings = await Booking.find({ user });
    const tourIds = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });
    res.status(200).render('booking', {
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
const getUser = catchAsync(async (req, res, next) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    const bookings = await Booking.find({ user: userId }).select('-user');
    if (!user) next(new appError('User does not exist', 404));

    res.status(200).render('user', {
        title: `User | ${user.name}`,
        search_user: user,
        bookings,
    });
});

export {
    getOverview,
    getTour,
    getLoginForm,
    getAccount,
    getMyTours,
    getAllUsers,
    getUser,
    getSignupForm,
};
