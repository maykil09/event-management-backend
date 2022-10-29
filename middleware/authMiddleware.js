const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Profile = require("../models/profile");

const protected = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // verify token
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            //Get user from the token
            req.user = await User.findById(decoded.data).select("-hashValue");
            // const profile = await Profile.findOne({accountId: decoded.data});

            // console.log(req.user);

            // // req.user = {...req.user, role: profile.role};

            next();
        } catch (error) {
            console.log(error);
            res.status(400);
            throw new Error("Not authorized!");
        }
    }

    if (!token) {
        res.status(400);
        throw new Error("Not authorized! No token");
    }
});

module.exports = {protected};
