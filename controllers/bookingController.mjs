import Stripe from 'stripe';
import Tour from '../models/tourModel.mjs';
import catchAsync from '../ultils/catchAsync.mjs';
import Booking from '../models/bookingModel.mjs';
import User from '../models/userModel.mjs';
const stripe = new Stripe(
    'sk_test_51MpCA0DfcEM9cIAm0SlXbB7WjZpXe7HEwSwCAjde0FZoLndTIYUnHJsp5F5HEcyEUpCy9zJiU2OIIFRf2t5KNnXx00PnlNRkfx'
);
const checkOutSession = catchAsync(async (req, res) => {
    console.log('checkOutSession');
    //1. Get tour
    const tour = await Tour.findById(req.params.tourID);
    //2. Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        client_reference_id: req.params.tourID,
        customer_email: req.user.email,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `${req.protocol}://${req.get('host')}/img/tours/${
                                tour.imageCover
                            }`,
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

const createBookingCheckout = catchAsync(async (session) => {
    const user = (await User.findOne({ email: session.customer_email }))._id;
    const tour = session.client_reference_id;
    const price = session.amount_total / 100;
    await Booking.create({
        tour,
        user,
        price,
    });
});

const bookingCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event = req.body;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object);
    }

    res.status(200).json({ received: true, data: event.data.object });
};
export { checkOutSession, bookingCheckout };
