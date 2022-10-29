const mongoose = require("mongoose");

const subscriptionPurchaseSchema = mongoose.Schema(
    {
        subscription_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscryption"
        },
        date_purchased: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "SubscriptionPurchase",
    subscriptionPurchaseSchema
);
