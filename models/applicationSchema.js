const mongoose = require('mongoose');
var validator = require('validator');

const Schema = mongoose.Schema;

const applicationSchema = new Schema({
    name: {
        type: String,
        require: [true, "pleasebprovide your name"],
        minLength: [3, "name must conatin at least 3 characters"],
        maxLength: [30, "name can not axceed at  30 characters"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "please provide your email"],
        validate: [validator.isEmail, "please provide a valid email"]
    },
    coverLetter: {
        type: String,
        required: [true, "please provide your coverletter"],
    },
    phone: {
        type: Number,
        required: [true, "please provide your phone number"]
    },
    address: {
        type: String,
        required: [true, "please provide your address"]
    },
    resume: {
        type: String,
        required: true
    },
    applicantID: {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "userModel",
            required: true
        },
        role: {
            type: String,
            enum: ["job seeker"],
            required: true
        }
    },
    employerID: {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "userModel",
            required: true
        },
        role: {
            type: String,
            enum: ["employer"],
            required: true
        }
    }
})

const MyModel = mongoose.model('applicationModel', applicationSchema);

module.exports = MyModel;
