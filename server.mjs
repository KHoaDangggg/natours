import dotenv from 'dotenv';
import app from './app.mjs';
import mongoose from 'mongoose';

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    process.exit(1);
});
dotenv.config({ path: './config.env' });

console.log(process.env.NODE_ENV);
//DB Connection
const db = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
mongoose.set('strictQuery', true);
mongoose
    .connect(db, {
        // useNewUrlParser: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
    })
    .then((con) => {
        console.log('DB connect successful');
    });

//Listen server
const port = 3000;
const server = app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
