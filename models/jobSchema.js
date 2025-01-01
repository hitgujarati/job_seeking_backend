const mongoose = require('mongoose');
var validator = require('validator');

const Schema = mongoose.Schema;

const jobSchema = new Schema({
    title: {
        type: String,
        required: [true, "please provide job title"],
        minLength: [3, "job title must contain at least 3 characters"],
        maxLength: [50, "job title cant exceed 50 characters"],
    },
    description: {
        type: String,
        required: [true, "please provide description"],
        minLength: [50, "job description must contain at least 50 characters"],
        maxLength: [350, "job description cant exceed 350 characters"],
    },
    category: {
        type: String,
        require: [true, "job category is required"],
    },
    country: {
        type: String,
        require: [true, "job country is required"],
    },
    city: {
        type: String,
        require: [true, "job city is required"],
    },
    location: {
        type: String,
        require: [true, "job loacation is required"],
        minLength: [10, "job location must contains at least 50 charecters"]
    },
    fixedSalary: {
        type: Number,
        minLength: [4, "fixedsalary must contain at least 4 characters"],
        maxLength: [9, "fixedsalary cant exceed 9 characters"],
    },
    salaryFrom: {
        type: Number,
        minLength: [4, "salary from must contain at least 4 characters"],
        maxLength: [9, "salary from cant exceed 9 characters"],
    },
    salaryTo: {
        type: Number,
        minLength: [4, "salaryTo must contain at least 4 characters"],
        maxLength: [9, "salaryTo cant exceed 9 characters"],
    },
    expired: {
        type: Boolean,
        default: false
    },
    jobPostedOn: {
        type: Date,
        default: Date.now
    },
    postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "userModel",
        required: true
    }
})

const MyModel = mongoose.model('jobModel', jobSchema);

module.exports = MyModel;
