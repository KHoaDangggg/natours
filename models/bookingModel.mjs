import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a tour'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to an user'],
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price'],
    },
    createAt: {
        type: Date,
        default: Date.now(),
    },
    paid: {
        type: Boolean,
        default: true,
    },
});

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name ratingsAverage summary imageCover startDates startLocation',
    });
    next();
});
const booking = mongoose.model('booking', bookingSchema);
export default booking;
