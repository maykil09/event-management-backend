const mongoose = require("mongoose");

const organizerBookingSchema = mongoose.Schema(
    {
        organizer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        customer_budget: {
            from: {
                type: String
            },
            to: {
                type: String
            }
        },
        agreed_price: {
            type: String
        },
        booking_description: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("OrganizerBooking", organizerBookingSchema);
