const express = require("express");
const router = express.Router();
const {protected} = require("../middleware/authMiddleware");
const {
    createSubscription,
    extendSubscription
} = require("../controllers/subscription/subscriptionController");

router.post("/subscription", protected, createSubscription);
router.post("/subscription/extend", protected, extendSubscription);

module.exports = router;
