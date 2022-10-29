const mongoose = require("mongoose");

const subscriptionSchema = mongoose.Schema(
    {
        client_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        plan_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plan"
        },
        subscription_start_date: {
            type: Date,
            required: true
        },
        subscription_end_date: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
