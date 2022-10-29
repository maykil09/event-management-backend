const express = require("express");
const router = express.Router();
const {protected} = require("../middleware/authMiddleware");
const {
    createPlan,
    updatePlanStatus,
    getAllPlan
} = require("../controllers/plan/planController");

router.get("/plan", protected, getAllPlan);
router.post("/plan", protected, createPlan);
router.post("/plan/update-status", protected, updatePlanStatus);

module.exports = router;
