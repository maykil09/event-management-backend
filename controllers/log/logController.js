const asyncHandler = require("express-async-handler");
const Log = require("../../models/logModel");

const getAllLogs = asyncHandler(async (req, res) => {
    const {role} = req.user;

    if (role === "super-admin") {
        const logs = await Log.find({})
            .sort({createdAt: "desc"})
            .populate("accountId");

        return res.status(200).json(logs);
    } else {
        res.status(400);
        throw new Error("Not authorize");
    }
});

module.exports = {
    getAllLogs
};
