const express = require("express");
const router = express.Router();

const log = require("../controllers/log/logController");
const {protected} = require("../middleware/authMiddleware");

router.get("/logs", protected, log.getAllLogs);

module.exports = router;
