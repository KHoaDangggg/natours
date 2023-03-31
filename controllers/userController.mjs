import catchAsync from '../ultils/catchAsync.mjs';
import User from '../models/userModel.mjs';
import appError from '../ultils/appError.mjs';
import { deleteOne, getAll, getOne, updateOne } from './handlerFactory.mjs';
import multer from 'multer';
import sharp from 'sharp';

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
const uploadUserPhoto = upload.single('photo');
const resizeUserPhoto = catchAsync(async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }
        req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
        await sharp(req.file.buffer)
//             .resize(500, 500)
//             .toFormat('jpeg')
//             .jpeg({ quality: 90 })
               .toFile(`./public/img/users/${req.file.filename}`);
        next();
    } catch (error) {
        console.log('error in resize');
    }
});

const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};
const ObjFilter = (obj, ...allowedFields) => {
    const allowedObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            allowedObj[el] = obj[el];
        }
    });
    return obj;
};
const filterUpdateFields = (req, res, next) => {
    //1. Avoid password updated POSTED
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new appError('You can not update password via this route', 400)
        );
    }
    //2. Filter out updated fields that are not allowed
    req.body = ObjFilter(req.body, 'name', 'email');
    if (req.file) {
        req.body.photo = req.file.filename;
        return next();
    }
    delete req.body.photo;
    next();
};
const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'Success',
    });
});
const getAllUsers = getAll(User);
const updateMe = updateOne(User);
const getOneUser = getOne(User);
const deleteUser = deleteOne(User);
export {
    getAllUsers,
    updateMe,
    deleteMe,
    deleteUser,
    filterUpdateFields,
    getOneUser,
    getMe,
    uploadUserPhoto,
    resizeUserPhoto,
};
