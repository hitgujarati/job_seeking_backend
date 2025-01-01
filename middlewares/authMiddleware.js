var jwt = require('jsonwebtoken');
const userSchema = require("../models/userSchema");

const isAuthorized = async (req, res, next) => {
    const { token } = req.cookies;
    // console.log("this is ", token);
    if (!token) {
        return res.status(400).json({
            status: false,
            msg: "User not authorized"
        })
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);//in decode we get one user and its details

    req.user = await userSchema.findById(decode.id);
    // console.log("user is", req.user);

    next();
}

module.exports = isAuthorized;