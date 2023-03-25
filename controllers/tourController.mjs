import Tour from '../models/tourModel.mjs';
import catchAsync from '../ultils/catchAsync.mjs';
import appError from '../ultils/appError.mjs';
import multer from 'multer';
import sharp from 'sharp';
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './handlerFactory.mjs';

const storage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new appError('Not an image!', 400), false);
    }
};

const upload = multer({
    storage,
    fileFilter: multerFilter,
});
const uploadTourPhoto = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]);
const resizeTourPhoto = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();
    //1. Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);
    //2. Images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, index) => {
            const fileName = `tour-${req.params.id}-${Date.now()}-${
                index + 1
            }.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${fileName}`);
            req.body.images.push(fileName);
        })
    );
    next();
});
const getAllTours = getAll(Tour);
const createTour = createOne(Tour);
const getTour = getOne(Tour, { path: 'review' });
const updateTour = updateOne(Tour);
const deleteTour = deleteOne(Tour);
const aliasTopTours = catchAsync(async (req, res, next) => {
    (req.query.page = '1'),
        (req.query.limit = '5'),
        (req.query.sort = '-ratingsAverage, price');
    req.query.fields = 'name, price, ratingsAverage, summary, duration';
    next();
});
const getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $group: {
                _id: '$difficulty',
                numTour: { $count: {} },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
    ]);
    res.status(202).json({
        status: 'Success',
        data: {
            stats,
        },
    });
});
const monthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTours: { $count: {} },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: {
                month: '$_id',
            },
        },
        {
            $sort: { numTours: -1 },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);
    res.status(202).json({
        status: 'Success',
        results: plan.length,
        data: {
            plan,
        },
    });
});
const getTourWithIn = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [latitude, longtitude] = latlng.split(',');
    if (!latitude || !longtitude) {
        return next(
            new appError('Please provide valid format of location', 400)
        );
    }
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[longtitude, latitude], radius],
            },
        },
    });
    res.status(200).json({
        status: 'Success',
        results: tours.length,
        data: {
            tours,
        },
    });
});
const getDistance = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [latitude, longtitude] = latlng.split(',');
    if (!latitude || !longtitude) {
        return next(
            new appError('Please provide valid format of location', 400)
        );
    }
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [longtitude * 1, latitude * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);
    res.status(200).json({
        status: 'Success',
        data: {
            distances,
        },
    });
});
export {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    monthlyPlan,
    getTourWithIn,
    getDistance,
    uploadTourPhoto,
    resizeTourPhoto,
};
