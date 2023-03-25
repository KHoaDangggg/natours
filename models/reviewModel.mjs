import { Schema, model } from 'mongoose';
import Tour from './tourModel.mjs';

const reviewSchema = new Schema(
    {
        review: {
            type: String,
            minLength: [10, 'This review is not long enough'],
            required: [true, 'Review can not be empty'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to an user'],
        },
        tour: {
            type: Schema.Types.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to an tour'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Statics
reviewSchema.statics.calcAvgRating = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                avgRating: { $avg: '$rating' },
                numRating: { $count: {} },
            },
        },
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].numRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 0,
        });
    }
};

reviewSchema.index(
    {
        tour: 1,
        user: 1,
    },
    {
        unique: true,
    }
);
// Document middleware
reviewSchema.post('save', async function () {
    this.constructor.calcAvgRating(this.tour);
});
//Query middleware
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo',
    });
    // .populate({
    //     path: 'tour',
    //     select: 'name duration',
    //     autopopulate: { maxDepth: 1 },
    // });
    next();
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.clone().findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAvgRating(this.r.tour);
});

const reviewModel = model('Review', reviewSchema);

export default reviewModel;
