import mongoose, { Schema, model } from 'mongoose';
import slugify from 'slugify';
import User from './userModel.mjs';
const tourSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
        },
        ratingsAverage: {
            type: Number,
            default: 0,
            min: [0, 'Rate must be greater than or equals to 0'],
            max: [5, 'Rate must be smaller than or equals to 5'],
            set: (value) => Math.round(value * 10) / 10,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        summary: {
            type: String,
            required: [true, 'A tour must have a description'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Tour must have a price'],
        },
        priceDiscount: {
            type: Number,
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty must be easy or medium or difficult',
            },
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createAt: {
            type: Date,
            default: Date.now(),
        },
        startDates: [Date],
        slug: String,
        secret: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            description: String,
            address: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                description: String,
                address: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
tourSchema.index({
    price: 1,
    ratingAverage: -1,
});
tourSchema.index({
    startLocation: '2dsphere',
});

// Virtual properties
tourSchema.virtual('durationWeek').get(function () {
    return this.duration / 7;
});
// Virtual populate
tourSchema.virtual('review', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});
// Document middleware:
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

tourSchema.post('save', (doc, next) => {
    next();
});

// Query middleware
tourSchema.pre(/^find/, function (next) {
    this.find({ secret: { $ne: true } });
    next();
});
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt',
    });
    next();
});

// Aggregate middleware
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({
//         $match: { secret: { $ne: true } },
//     });
//     next();
// });
const Tour = model('Tour', tourSchema);
export default Tour;
