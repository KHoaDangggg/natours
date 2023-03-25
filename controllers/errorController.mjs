import appError from '../ultils/appError.mjs';

const handleCastErrDB = (err) =>
    new appError(`Invalid ${err.path} ${err.value}`, 400);
const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue.name;
    return new appError(`Invalid duplicate name /${value}/`, 400);
};
const handleValidationErr = (err) => {
    const errors = Object.values(err.errors)
        .map((ele) => ele.message)
        .join('. ');
    return new appError(`Invalid request. ${errors}`, 400);
};
const handleJWTErr = () => new appError('Invalid token', 401);
const handleExpiredErr = () =>
    new appError('Your token was expired. Please login again', 401);
const sendErrProd = (err, req, res) => {
    //API
    console.log(err);
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        return res.status(500).json({
            status: 'ERROR',
            message: 'Something went wrong!',
        });
    }
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Error',
            msg: err.message,
        });
    }
    res.status(err.statusCode).render('error', {
        title: 'Error',
        msg: 'Something went wrong',
    });
};

const sendErrDev = (err, req, res) => {
    console.log(err);
    // API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            err,
            message: err.message,
            stack: err.stack,
        });
    }
    res.status(err.statusCode).render('error', {
        title: 'Error',
        msg: err.message,
    });
};
export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrDev(err, req, res);
    } else {
        let error = { ...err };
        err.message = error.message;
        if (err.code === 11000) error = handleDuplicateFieldsDB(error);
        if (err.name === 'CastError') error = handleCastErrDB(error);
        if (err.name === 'ValidationError') error = handleValidationErr(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTErr();
        if (err.name === 'TokenExpiredError') error = handleExpiredErr();
        sendErrProd(error, req, res);
    }
};
