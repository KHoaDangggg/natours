import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import Tour from './../../models/tourModel.mjs';
import User from './../../models/userModel.mjs';
import Review from './../../models/reviewModel.mjs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: './config.env' });

//DB Connection
const db = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
mongoose.connect(db, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
});

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, {
            validateBeforeSave: false,
        });
        await Review.create(reviews);
        console.log('Read data successfully');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

//DELETE DATA FORM COLLECTION
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Delete data successfully');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
