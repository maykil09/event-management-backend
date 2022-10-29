const express = require("express");
const router = express.Router();

const {protected} = require("../middleware/authMiddleware");

const user = require("../controllers/user/userController");

router.post("/user/register", (req, res) => user.createUser(req, res));

router.post("/user/login", (req, res) => user.loginUser(req, res));

router.put("/user/disable", (req, res) => user.disableUser(req, res));

router.post("/user/create/account", protected, (req, res) =>
    user.createUserAccount(req, res)
);

router.get("/user/getTotalCustomer", protected, user.getTotalCustomer);
router.get("/user/getTotalPlanner", protected, user.getTotalPlanner);
router.get("/user/getTotalOrganizer", protected, user.getTotalOrganizer);
router.get("/user/getAllOrganizer", protected, user.getAllOrganizer);
router.get("/user/getAllEventPlanner", protected, user.getAllEventPlanner);
router.post(
    "/user/activateOrganizer",
    protected,
    user.activateOrganizerAccount
);
router.post(
    "/user/activateEventPlanner",
    protected,
    user.activateEventPlannerAccount
);

router.get("/user/getAllCustomer", protected, user.getAllCustomer);

router.post("/user/create/customer", user.createCustomer);

module.exports = router;
