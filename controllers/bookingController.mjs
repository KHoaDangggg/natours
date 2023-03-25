import Stripe from 'stripe';
import Tour from '../models/tourModel.mjs';
import catchAsync from '../ultils/catchAsync.mjs';
import Booking from '../models/bookingModel.mjs';

const stripe = new Stripe(
    'sk_test_51MpCA0DfcEM9cIAm0SlXbB7WjZpXe7HEwSwCAjde0FZoLndTIYUnHJsp5F5HEcyEUpCy9zJiU2OIIFRf2t5KNnXx00PnlNRkfx'
);
const checkOutSession = catchAsync(async (req, res) => {
    //1. Get tour
    const tour = await Tour.findById(req.params.tourID);
    //2. Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${
            req.params.tourID
        }&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.customer_email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `https://wwww.natours.dev/img/tours/${tour.imageCover}`,
                        ],
                    },
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
    });
    //3. Create session as response
    res.status(201).json({
        status: 'success',
        session,
    });
});

const createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;
    if (!tour || !user || !price) return next();
    res.redirect(`${req.protocol}://${req.get('host')}/`);
});
export { checkOutSession, createBookingCheckout };
