require("dotenv").config();
const moment = require("moment");
const asyncHandler = require("express-async-handler");
const Subscription = require("../../models/subscriptionModel");
const SubscriptionPurchase = require("../../models/subscriptionPurchase");
const User = require("../../models/user");
const Plan = require("../../models/planModel");

const {v4: uuidv4} = require("uuid");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createSubscription = asyncHandler(async (req, res) => {
    const {role, id} = req.user;
    const {token, amount, plan_id} = req.body;

    const idempotencyKey = uuidv4();

    if (role !== "super-admin") {
        // Check if user has current subscription
        const hasSubscription = await Subscription.findOne({client: id});

        if (hasSubscription) {
            res.status(400);
            throw new Error("User already have subscription");
        }

        const planExist = await Plan.findById(plan_id);

        if (!planExist) {
            res.status(400);
            throw new Error("Plan does not exist");
        }

        // add customer to stripe
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });

        // if succeed
        if (customer) {
            // Charge cutomer for base on plan
            const charge = await stripe.charges.create(
                {
                    amount: amount * 100,
                    currency: "usd",
                    customer: customer.id,
                    receipt_email: token.email,
                    description: "Subscription Payment"
                },
                {idempotencyKey}
            );

            if (charge.status === "succeeded") {
                const subscription = await Subscription.create({
                    client_id: id,
                    plan_id: req.body.plan_id,
                    subscription_start_date: moment(),
                    subscription_end_date: moment().add("1", "months")
                });

                if (subscription) {
                    const subPurchase = await SubscriptionPurchase.create({
                        subscription_id: subscription.id,
                        date_purchased: moment()
                    });

                    return res.status(201).json({
                        subscription,
                        subPurchase
                    });
                } else {
                    res.status(400);
                    throw new Error("Invalid subscription data");
                }
            } else {
                res.status(400);
                throw new Error("Something when wrong in charging customer");
            }

            // return res.status(200).json(charge);
        } else {
            res.status(400);
            throw new Error("Invalid data");
        }
    } else {
        res.status(400);
        throw new Error("Not valid role");
    }
});

const extendSubscription = asyncHandler(async (req, res) => {
    const {role, id} = req.user;
    const {token, amount, plan_id, subscription_id} = req.body;

    const idempotencyKey = uuidv4();

    const planExist = await Plan.findById(plan_id);

    if (!planExist) {
        res.status(400);
        throw new Error("Plan does not exist");
    }

    //Check if subscription exist
    const subExist = await Subscription.findById(subscription_id);

    if (subExist) {
        res.status(400);
        throw new Error("No existing subscription to extend");
    }

    // add customer to stripe
    const customer = await stripe.customers.create({
        email: token.email,
        source: token.id
    });

    // if succeed
    if (customer) {
        // Charge cutomer for base on plan
        const charge = await stripe.charges.create(
            {
                amount: amount * 100,
                currency: "usd",
                customer: customer.id,
                receipt_email: token.email,
                description: "Subscription Payment"
            },
            {idempotencyKey}
        );

        if (charge.status === "succeeded") {
            const updatedDates = {
                subscription_start_date: moment(
                    subExist.subscription_end_date
                ).isBefore(moment())
                    ? moment()
                    : subExist.subscription_end_date,
                subscription_end_date: moment(
                    subExist.subscription_end_date
                ).isBefore(moment())
                    ? moment().add("1", "months")
                    : moment(subExist.subscription_end_date).add("1", "months")
            };

            const updatedSubscription = await Subscription.findByIdAndUpdate(
                subscription_id,
                updatedDates,
                {
                    new: true
                }
            );

            if (updatedSubscription) {
                const subPurchase = await SubscriptionPurchase.create({
                    subscription_id: updatedSubscription.id,
                    date_purchased: moment()
                });

                return res.status(201).json({
                    updatedSubscription,
                    subPurchase
                });
            }
        }
    }
});

const upgradeSubscription = asyncHandler(async (req, res) => {});

module.exports = {
    createSubscription,
    extendSubscription,
    upgradeSubscription
};
