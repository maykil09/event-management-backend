const mongoose = require("mongoose");

const organizerDetailsSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        organizer_rate: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("OrganizerDetails", organizerDetailsSchema);
