import User from '../models/userModel.mjs';
import catchAsync from '../ultils/catchAsync.mjs';
import jwt from 'jsonwebtoken';
import appError from '../ultils/appError.mjs';
import { promisify } from 'util';
import Email from '../ultils/email.mjs';
import crypto from 'crypto';
const signToken = (id) => {
    return jwt.sign(
        {
            id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE_IN,
        }
    );
};
const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(
            Date.now() + process.env.COOKIE_JWT_EXPIRE_IN * 24 * 3600 * 1000
        ),
        //secure: req.secure || req.headers('x-forwarded-proto' === 'https'),
    };
    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
        status: 'success',
        token,
        user,
    });
};
const signup = catchAsync(async (req, res, next) => {
    const url = `${req.protocol}://${req.get('host')}/me`;
    const { name, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
        passwordChangedAt: new Date(Date.now()),
    });
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, req, res);
});
const login = catchAsync(async (req, res, next) => {
    //1. Check if email or password exist
    const { email, password } = req.body;
    if (!email || !password)
        return new appError('Please provide password and email', 400);
    //2. Check if User exist
    const user = await User.findOne({ email }).select('+password');
    //3. Check if password correct or and user exist
    const correct = await user.correctPassword(password, user.password);
    if (!user || !correct)
        return next(new appError('Incorrect email or password', 401));
    //4. Send token to user
    createSendToken(user, 201, req, res);
});
const logOut = (req, res, next) => {
    res.cookie('jwt', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now() + 10 * 1000),
    });

    res.status(200).json({
        status: 'success',
    });
};
const protect = catchAsync(async (req, res, next) => {
    //1. Check token exist
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError('You are not logged in to get access', 401));
    }
    //2. Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //3. Check if user still exist
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(
            new appError(
                'The user belonging to this token does no longer exist'
            ),
            401
        );
    }
    //4. Check if users changed password after token was created
    if (freshUser.changedPassAfter(decoded.iat)) {
        return next(
            new appError(
                "User's password has recently changed. Please log in again to get access"
            ),
            401
        );
    }

    //5. Grant access to protected route
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
});

const isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            //2. Verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            //3. Check if user still exist
            const freshUser = await User.findById(decoded.id).select('+photo');
            if (!freshUser) {
                return next();
            }
            //4. Check if users changed password after token was created
            if (freshUser.changedPassAfter(decoded.iat)) {
                return next();
            }
            //5. User is logged
            res.locals.user = freshUser;
            return next();
        }
        next();
    } catch (error) {
        return next();
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new appError(
                    "You don't have permission to perform this action.",
                    403
                )
            );
        }
        next();
    };
};

const forgotPassword = catchAsync(async (req, res, next) => {
    //1.Check if user exist
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new appError('User does not exist'), 401);
    }
    //2. Generate the random reset token
    const resetToken = user.createResetPassToken();
    await user.save({ validateBeforeSave: false });
    //3. Send token to user's email
    try {
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'Success',
            message: 'Token was sent to email successfully',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    }
});

const resetPassword = catchAsync(async (req, res, next) => {
    //1. Get user based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    //2. If token is not expired and user exists, set new password
    if (!user) {
        return next(new appError('Token is in valid or expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //3. Update changedPasswordAt

    //4. Log user in with JWT
    createSendToken(user, 201, req, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
    //1. Get user from collection
    const user = await User.findById(req.user._id).select('+password');
    //2. Check if POSTED password is correct
    const correct = await user.correctPassword(
        req.body.passwordCurrent,
        user.password
    );
    if (!correct) {
        return next(new appError('Your current password is wrong', 401));
    }
    //3. If correct, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //4. Log user in, send JWT
    createSendToken(user, 201, req, res);
});
export {
    signup,
    login,
    protect,
    restrictTo,
    forgotPassword,
    resetPassword,
    updatePassword,
    isLoggedIn,
    logOut,
};
