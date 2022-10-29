const mongoose = require("mongoose");

const planSchema = mongoose.Schema({
    plan_name: {
        type: String,
        required: true
    },
    price_per_month: {
        type: String,
        required: true
    },
    plan_description: {
        type: String
    },
    plan_status: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model("Plan", planSchema);
