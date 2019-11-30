const Bootcamp = require('../models/Bootcamp');
const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');


// @desc - get reviews
// @route  GET /api/v1/reviews
// @route  GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public (dosn't need a token)

exports.getReviews = asyncHandler(async (req, res, next) => {

    if(req.params.bootcampId){
        const reviews = await Review.find({bootcamp: req.params.bootcampId});
        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
        res.status(200).json(res.advancedResults);
    }

});

// @desc - get reviews
// @route  GET /api/v1/reviews/:id
// @access Public (dosn't need a token)

exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!review){
        return next( new ErrorResponse(`No review found for id: ${req.params.id}`, 404));
    }

    res.status(200).json({success: true, data: review});
});

// @desc - Add review to a bootcamp
// @route  POST /api/v1/bootcamps/:bootcampId/reviews
// @access Private

exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
        return next (new ErrorResponse(`Bootcamp with id ${req.params.bootcampId} not found`,404));
    }

    const review = await Review.create(req.body);
    res.status(201).json({success: true, data: review});
});


// @desc - Update review to a bootcamp
// @route  PUT /api/v1/reviews/:id
// @access Private

exports.updateReview = asyncHandler(async (req, res, next) => {

    let review = await Review.findById(req.params.id);

    if(!review){
        return next (new ErrorResponse(`Review with id ${req.params.id} not found`,404));
    }

    // Make sure review belings to user or user is admin

    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next (new ErrorResponse(`Not authorised to update this review`,401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({success: true, data: review});
});

// @desc - Delete review to a bootcamp
// @route  PUT /api/v1/reviews/:id
// @access Private

exports.deleteReview = asyncHandler(async (req, res, next) => {

    let review = await Review.findById(req.params.id);

    if(!review){
        return next (new ErrorResponse(`Review with id ${req.params.id} not found`,404));
    }

    // Make sure review belings to user or user is admin

    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next (new ErrorResponse(`Not authorised to update this review`,401));
    }

    await review.remove();

    res.status(200).json({success: true, data: {}});
});