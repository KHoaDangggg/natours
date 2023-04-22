import express from 'express';
import path from 'path';
import morgan from 'morgan';
import viewsRouter from './routes/viewRoute.mjs';
import toursRouter from './routes/tourRoute.mjs';
import usersRouter from './routes/userRoute.mjs';
import bookingRouter from './routes/bookingRoute.mjs';
import reviewsRouter from './routes/reviewRoute.mjs';
import appError from './ultils/appError.mjs';
import globalErrorHandler from './controllers/errorController.mjs';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as url from 'url';
import { bookingCheckout } from './controllers/bookingController.mjs';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = express();
app.enable('trust proxy');
app.use(function (req, res, next) {
    res.setHeader(
        'Content-Security-Policy',
        "script-src 'self' https://cdnjs.cloudflare.com"
    );
    next();
});
//1. Global middlewares

app.use(cors());

app.options('*', cors());
//. Set template engines
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//. Serve static file
app.use(express.static(path.join(__dirname, 'public/')));

//. Set security HTTP headers
app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: {
            allowOrigins: ['*'],
        },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ['*'],
                scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"],
            },
        },
    })
);

//. Development logging
app.use(morgan('dev'));
//. Limit request from same API
const rateLimiter = rateLimit({
    max: 100,
    windowMs: 60 * 3600 * 1000,
    message: 'Too many request to server',
});
app.use('/api', rateLimiter);
app.post(
    '/webhook-checkout',
    express.raw({ type: 'application/json' }),
    bookingCheckout
);
//. Body parser, read data from body to req.body

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(
    express.json({
        limit: '10kb',
    })
);
app.use(cookieParser());
//. Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//. Data sanitization against XSS
app.use(xss());
//. Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingAverage',
            'ratingQuantity',
            'price',
            'difficulty',
            'maxGroupSize',
        ],
    })
);
app.use(compression());
// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

//2. Route
app.use('/', viewsRouter);

//API
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/booking', bookingRouter);
app.all('*', (req, res, next) => {
    next(new appError(`Can not find ${req.originalUrl} on this server`));
});

//.Handle global error
app.use(globalErrorHandler);

export default app;
