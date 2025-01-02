const mongoose = require('mongoose');
var validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: [3, "name must contain at least 3 characters"],
        maxLength: [30, "name can not exceed  30 characters"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "please provide your email"],
        validate: [validator.isEmail, "please provide a valid email"]
    },
    phone: {
        type: Number,
        required: [true, "please provide your phone number"]
    },
    password: {
        type: String,
        required: [true, "please provide your password!"],
        minLength: [8, "password must contain at least 8 characters"],
        maxLength: [1024, "password can not exceed  1024 characters"],
    },
    role: {
        type: String,
        required: [true, "please provide your role"],
        enum: ["job seeker", "employer"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});


const MyModel = mongoose.model('userModel', userSchema);

module.exports = MyModel;
