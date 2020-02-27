const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const  {
    JWT_SECRET,
    JWT_EXPIRE,
    JWT_COOKIE_EXPIRE
} = process.env;

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email address'],
        unique: true,
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please enter a valid email address']
    },
    role:{
        type: String,
        enum: ['user','publisher','admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

// Encrypt password using bcrypt

UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        next();
    }
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash( this.password, salt);

});

// Sign JWT and return
UserSchema.methods.getSignedJWTToken = function () {
    return jwt.sign({id: this._id},process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in the database

UserSchema.methods.matchPassword = async function(enteredPassowrd){
    return await bcrypt.compare(enteredPassowrd, this.password);
};

// Generate and return reset token

UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPassordToken field

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now()+ 10  * 60 * 1000;

    return resetToken;

};

module.exports = mongoose.model('User',UserSchema);