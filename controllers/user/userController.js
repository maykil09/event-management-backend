require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");
const Profile = require("../../models/profile");

const Log = require("../../models/logModel");

const asyncHandler = require("express-async-handler");

const createUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const doesExist = await User.findOne({email});

        if (doesExist)
            return res.status(400).send({message: "Email is currently used"});

        await bcrypt.hash(password, 12).then(async (hashValue) => {
            new User({email, hashValue})
                .save()
                .then((value) =>
                    res.status(200).json({
                        accountId: value._id,
                        email,
                        password: hashValue
                    })
                )
                .catch((err) => res.status(400).send(err));
        });
    } catch (error) {
        console.log(error);
    }
};

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        console.log(user);
        if (!user)
            return res.status(400).json({message: "Account doesn't exist"});

        await bcrypt.compare(password, user.hashValue).then(async (value) => {
            if (value == false)
                return res.status(400).json({message: "Invalid login"});

            const accessToken = jwt.sign(
                {data: user._id.toString()},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: "7d"}
            );

            const log = await Log.create({
                accountId: user._id,
                message: "Logged in"
            });

            return res.status(200).json({...user._doc, accessToken});
        });
    } catch (error) {
        console.log(error);
    }
};

const disableUser = async (req, res) => {
    try {
        const {_id, disabled} = req.body;
        User.findByIdAndUpdate(_id, {disabled}, {new: true})
            .then((value) => {
                if (!value)
                    return res
                        .status(400)
                        .json({message: "accountId not found"});
                return res.status(200).json(value);
            })
            .catch((err) => res.status(400).json(err));
    } catch (error) {
        console.error(error);
    }
};

// Get total customer
const getTotalCustomer = asyncHandler(async (req, res) => {
    const {role} = req.user;

    if (role === "super-admin") {
        const customer = await User.find({role: "customer"}).select(
            "-hashValue"
        );

        return res.status(200).json({
            count: customer.length,
            customers: customer
        });
    } else {
        console.log("Not authorized!");
    }
});

// Get total planner
const getTotalPlanner = asyncHandler(async (req, res) => {
    const {role} = req.user;

    if (role === "super-admin") {
        const planner = await User.find({role: "planner"}).select("-hashValue");

        return res.status(200).json({
            count: planner.length,
            planners: planner
        });
    } else {
        console.log("Not authorized!");
    }
});

// Get total organizer
const getTotalOrganizer = asyncHandler(async (req, res) => {
    const {role} = req.user;

    if (role === "super-admin") {
        const organizer = await User.find({role: "organizer"}).select(
            "-hashValue"
        );

        return res.status(200).json({
            count: organizer.length,
            organizers: organizer
        });
    } else {
        console.log("Not authorized!");
    }
});

const getAllOrganizer = asyncHandler(async (req, res) => {
    const {role, id} = req.user;

    const filterObj = [{role: "organizer"}];

    if (role === "super-admin") {
        filterObj.push({role: "super-organizer"});
    }

    const organizer = await User.find({$or: filterObj}).select("-hashValue");

    return res.status(200).json(organizer);
});

const getAllEventPlanner = asyncHandler(async (req, res) => {
    const {role, id} = req.user;

    const filterObj = [{role: "planner"}];

    if (role === "super-admin") {
        filterObj.push({role: "super-planner"});
    }

    const organizer = await User.find({$or: filterObj}).select("-hashValue");

    return res.status(200).json(organizer);
});

const getAllCustomer = asyncHandler(async (req, res) => {
    const {role, id} = req.user;

    if (role === "super-admin" || role === "admin") {
        const filterObj = [{role: "customer"}];

        // const customer = await User.find(
        //     {$or: filterObj},
        //     function (err, docs) {
        //         var ids = docs.map(function (doc) {
        //             return doc._id;
        //         });

        //         const profile = Profile.find({accountId: {$in: ids}}, function (err, docs) {
        //             // docs contains your answer
        //             // console.log(docs);
        //             // return res.status(200).json(docs);
        //             return docs;
        //         }).populate("accountId");
        //     }
        // ).select("-hashValue");
        const customer = await User.find({$or: filterObj}).select("-hashValue");
        console.log(customer);
        return res.status(200).json(customer);
    } else {
        res.status(400);
        throw new Error("Not authorize");
    }
});

// Create organizer
const createUserAccount = asyncHandler(async (req, res) => {
    const {id} = req.user;
    const {email, password, role} = req.body;

    const doesExist = await User.findOne({email});

    if (doesExist) {
        res.status(400);
        throw new Error("Email is not available");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        email,
        hashValue: hashedPassword,
        role: role,
        disabled: true
    });

    if (user) {
        const log = await Log.create({
            accountId: id,
            message: "Create a user"
        });
        res.status(200).json({
            accountId: user.id,
            email: user.email,
            password: user.password,
            role: user.role,
            disabled: user.disabled
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

const activateOrganizerAccount = asyncHandler(async (req, res) => {
    const {role, id} = req.user;
    const {user_id} = req.body;

    if (role === "super-admin" || role === "super-organizer") {
        const user = await User.findByIdAndUpdate(
            user_id,
            {disabled: false},
            {new: true}
        );

        if (user) {
            const log = await Log.create({
                accountId: id,
                message: "Activate account"
            });
            res.status(200).json(user);
        } else {
            res.status(400);
            throw new Error("User not found");
        }
    } else {
        res.status(400);
        throw new Error("Not authorize to activate account");
    }
});

const activateEventPlannerAccount = asyncHandler(async (req, res) => {
    const {role, id} = req.user;
    const {user_id} = req.body;

    if (role === "super-admin" || role === "super-planner") {
        const user = await User.findByIdAndUpdate(
            user_id,
            {disabled: false},
            {new: true}
        );

        if (user) {
            const log = await Log.create({
                accountId: id,
                message: "Activate account"
            });
            res.status(200).json(user);
        } else {
            res.status(400);
            throw new Error("User not found");
        }
    } else {
        res.status(400);
        throw new Error("Not authorize to activate account");
    }
});

const createCustomer = asyncHandler(async (req, res) => {
    const {email, password, role} = req.body;

    const doesExist = await User.findOne({email});

    if (doesExist) {
        res.status(400);
        throw new Error("Email is not available");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        email,
        hashValue: hashedPassword,
        role: role,
        disabled: false
    });

    if (user) {
        const log = await Log.create({
            accountId: id,
            message: "Create a user"
        });
        res.status(201).json({
            _id: user.id,
            email: user.email,
            password: user.password,
            role: user.role,
            disabled: user.disabled
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

module.exports = {
    createUser,
    loginUser,
    disableUser,
    getTotalCustomer,
    getTotalPlanner,
    getTotalOrganizer,
    createUserAccount,
    getAllOrganizer,
    getAllEventPlanner,
    activateOrganizerAccount,
    activateEventPlannerAccount,
    getAllCustomer,
    createCustomer
};

//const { sendEmail } = require("../services/nodemailer/mail");
// sendEmail(email,
//   "development.mail.ph@gmail.com",
//   "#AUTOMATED_NODEJS_MAIL #ByKOLYA",
//   "Account created",
//   "<b>Thank you for creating your account"
// );
