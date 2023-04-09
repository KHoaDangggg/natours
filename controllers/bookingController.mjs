import Stripe from 'stripe';
import Tour from '../models/tourModel.mjs';
import catchAsync from '../ultils/catchAsync.mjs';
import Booking from '../models/bookingModel.mjs';
import User from '../models/userModel.mjs';
const stripe = new Stripe(
    'sk_test_51MpCA0DfcEM9cIAm0SlXbB7WjZpXe7HEwSwCAjde0FZoLndTIYUnHJsp5F5HEcyEUpCy9zJiU2OIIFRf2t5KNnXx00PnlNRkfx'
);
const checkOutSession = catchAsync(async (req, res) => {
    //1. Get tour
    const tour = await Tour.findById(req.params.tourID);
    //2. Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
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
    const user = (await User.find({ email: session.customer_email })).id;
    const tour = session.client_reference_id;
    const price = session.display_items[0].price_data.unit_amount / 100;
    if (!tour || !user || !price) return next();
    await Booking.create({ tour, user, price });
    res.redirect(`${req.protocol}://${req.get('host')}/my-tours`);
});

const bookingCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return res.status(400).send(`Webhook error: ${error.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object);
    }
    res.status(200).json({
        received: true,
    });
};
export { checkOutSession, bookingCheckout };
