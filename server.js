const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require("xss-clean");
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


// load env variables
// 2/27/2020 - passing environment variable through docker compose .env file

const  {
    NODE_ENV,
    PORT,
    GEOCODER_PROVIDER,
    GEOCODER_API_KEY,
    FILE_UPLOAD_PATH,
    MAX_FILE_UPLOAD,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_EMAIL,
    SMTP_PASSWORD,
    FROM_EMAIL,
    FROM_NAME
} = process.env;


//  dotenv.config({path: './config/config.env'});

// connect to database
connectDB();

// route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// body parser
app.use(express.json());

// Cpokie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

// File uploading

app.use(fileupload());

// Sanitize data

app.use(mongoSanitize());

// Set static folder

app.use(express.static(path.join(__dirname,'public')));

//  Security headers

app.use(helmet());

// Cross site scripting

app.use(xss());

// Rate limiting

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200000
})

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());


//Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);

app.use(errorHandler);


const LOCALPORT = process.env.PORT || 5000;
const server = app.listen(LOCALPORT, () => {console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)});

//Handle unhandled promise rejections globally

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}.red`);
    server.close(() => process.exit(1));
});