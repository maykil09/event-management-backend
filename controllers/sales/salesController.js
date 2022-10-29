const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Subscription = require("../../models/subscriptionModel");
const SubscriptionPurchase = require("../../models/subscriptionPurchase");
const User = require("../../models/user");
const Plan = require("../../models/planModel");

const totalSales = asyncHandler(async (req, res) => {
    const {role, id} = req.user;

    if (role === "super-admin") {
        // return res.json({message: "Total sales"});
    }
});

module.exports = {
    totalSales
};
