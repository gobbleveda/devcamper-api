const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const fs = require('fs');

//Load env file
dotenv.config({path: './config/config.env'});

// load the models

const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

// connect to MongoDB

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// Read JSON and load them into MongoDB

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));
// import into DB

const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews);
        console.log('Data Imported...'.green.inverse);
        process.exit();
    } catch(e) {
        console.log(e);
    }
};

// remove all documents from DB

const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data deleted...'.red.inverse);
        process.exit();
    } catch(e) {
        console.log(e);
    }
};

if (process.argv[2] === '-i') {
    importData();
    } else if (process.argv[2] === '-d') {
    deleteData();
}


