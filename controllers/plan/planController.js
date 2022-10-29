const asyncHandler = require("express-async-handler");
const Plan = require("../../models/planModel");
const Log = require("../../models/logModel");

const createPlan = asyncHandler(async (req, res) => {
    const {role, id} = req.user;

    if (role === "super-admin") {
        const {name, price, status, description} = req.body;

        if (!name || !price) {
            res.status(400);
            throw new Error("Please fill up all fields");
        }

        // Check if plan exist
        const planExist = await Plan.findOne({plan_name: name});

        if (planExist) {
            res.status(400);
            throw new Error("Plan already exists");
        }

        // Create plan
        const plan = await Plan.create({
            plan_name: name,
            price_per_month: price,
            plan_description: description,
            plan_status: status !== "" ? status : "in-active"
        });

        if (plan) {
            const log = await Log.create({
                accountId: id,
                message: "Create a plan"
            });

            res.status(201).json({
                _id: plan.id,
                plan_name: plan.plan_name,
                plan_description: description,
                price_per_month: plan.price_per_month,
                plan_status: plan.plan_status
            });
        } else {
            res.status(400);
            throw new Error("Invalid plan data");
        }
    } else {
        res.status(400);
        throw new Error("Not Authorized");
    }
});

const updatePlanStatus = asyncHandler(async (req, res) => {
    const {role} = req.user;

    if (role === "super-admin") {
        const {id, status} = req.body;

        if (!id) {
            res.status(400);
            throw new Error("Please fill up all fields");
        }

        const plan = await Plan.findById(id);

        if (!plan) {
            res.status(400);
            throw new Error("Plan not found");
        }

        const updatedStatus = {
            plan_status: !status
        };

        const updatedPlan = await Plan.findByIdAndUpdate(id, updatedStatus, {
            new: true
        });

        // const log = await Log.create({
        //     accountId: req.user.id,
        //     message: "Update plan status"
        // });

        res.status(200).json(updatedPlan);
    } else {
        res.status(400);
        throw new Error("Not Authorized");
    }
});

const getAllPlan = asyncHandler(async (req, res) => {
    const {role} = req.user;

    if (role === "super-admin") {
        const plans = await Plan.find({});

        res.status(200).json(plans);
    } else {
        res.status(400);
        throw new Error("Not Authorized");
    }
});

module.exports = {
    createPlan,
    updatePlanStatus,
    getAllPlan
};
