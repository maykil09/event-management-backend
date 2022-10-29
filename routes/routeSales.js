const express = require("express");
const router = express.Router();
const {protected} = require("../middleware/authMiddleware");
const {totalSales} = require("../controllers/sales/salesController");

router.get("/sales", protected, totalSales);

module.exports = router;
