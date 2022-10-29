const Profile = require("../../models/profile");
const User = require("../../models/user");
const cloudinary = require("../../services/img-upload/cloundinary");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const {update} = require("lodash");
const Log = require("../../models/logModel");

const createProfile = async (req, res) => {
    try {
        const accountId = req.body.accountId;
        const doesExist = await Profile.findOne({accountId});
        if (doesExist)
            return res.status(400).json({message: "accountId already exist"});

        return new Profile(req.body)
            .save()
            .then(async (value) => {
                const log = await Log.create({
                    accountId: accountId,
                    message: "Logged in"
                });
                res.status(200).json(value);
            })
            .catch((err) => res.status(400).json(err.errors));
    } catch (error) {
        console.error(error);
    }
};
const getAllProfiles = async (req, res) => {
    try {
        const {role} = req.query;
        return Profile.find({role})
            .sort({createdAt: -1}) // filter by date
            .select({_id: 0, __v: 0}) // Do not return _id and __v
            .then((value) => res.status(200).json(value))
            .catch((err) => res.status(400).json(err));
    } catch (error) {
        console.error(error);
    }
};
const getProfile = asyncHandler(async (req, res) => {
    try {
        const accountId = req.params.id;

        const user = await User.findById(accountId);
        Profile.findOne({accountId})
            .populate("accountId")
            .select({_id: 0, __v: 0})
            .then((value) => {
                if (!value) {
                    if (user) {
                        return res.status(200).json({
                            message: "No profile data found"
                        });
                    }
                    return res
                        .status(400)
                        .json({message: "customer accountId not found"});
                }
                console.log(value);
                return res.status(200).json(value);
            })
            .catch((err) => res.status(400).json(err));
    } catch (error) {
        console.error(error);
    }
});
const updateProfile = async (req, res) => {
    try {
        // return res.json({message: "sulod"});
        const {accountId, name, contact, images} = req.body;

        var toUpdate = {
            "name.first": name.first,
            "name.last": name.last,
            "contact.number": contact.number,
            "date.updatedAt": Date.now()
        };

        if (images.length !== 0) {
            console.log(images);
            toUpdate["gallery"] = images;
        }

        Profile.findOneAndUpdate(
            {accountId},
            {
                $set: toUpdate
            },
            {new: true}
        )
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
const updateProfileVisibility = async (req, res) => {
    try {
        const {accountId, visibility} = req.body;
        Profile.findOneAndUpdate({accountId}, {visibility}, {new: true})
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
const updateProfileAddress = async (req, res) => {
    try {
        const {accountId, address} = req.body;
        Profile.findOneAndUpdate(
            {accountId},
            {
                $set: {
                    "address.name": address.name,
                    "address.coordinates.latitude":
                        address.coordinates.latitude,
                    "address.coordinates.longitude":
                        address.coordinates.longitude,
                    "date.updatedAt": Date.now()
                }
            },
            {new: true}
        )
            .then((value) => {
                if (!value)
                    return res
                        .status(400)
                        .json({message: "accountId not found"});
                return res.status(200).json(value);
            })
            .catch((err) => res.status(400).json(err));
    } catch (e) {
        return res.status(400).json({message: "Something went wrong"});
    }
};
const updateProfileAvatar = async (req, res) => {
    try {
        const accountId = req.body.accountId;
        const filePath = req.file.path;
        const options = {
            folder: process.env.CLOUDINARY_FOLDER + "/user/avatar",
            unique_filename: true
        };
        const uploadedImg = await cloudinary.uploader.upload(filePath, options);

        Profile.findOneAndUpdate(
            {accountId},
            {
                $set: {
                    avatar: uploadedImg.url,
                    "date.updatedAt": Date.now()
                }
            },
            {new: true}
        )
            .then((value) => {
                if (!value)
                    return res.status(400).json({message: "_id not found"});
                return res.status(200).json(value);
            })
            .catch((err) => res.status(400).json(err));
    } catch (error) {
        console.log(error);
    }
};

const uploadAvatar = asyncHandler(async (req, res) => {
    const {id} = req.user;
    const {imageStr} = req.body;

    const options = {
        folder: process.env.CLOUDINARY_FOLDER + "/user/avatar",
        unique_filename: true
    };

    const uploadedImage = await cloudinary.uploader.upload(imageStr, options);

    const toUpdate = {
        avatar: uploadedImage.url
    };

    const updateProfile = await Profile.findOneAndUpdate(
        {accountId: id},
        toUpdate,
        {
            new: true
        }
    );

    return res
        .status(200)
        .json({message: "Uploading successful", profile: updateProfile});
});

const uploadGallery = asyncHandler(async (req, res) => {
    const {id} = req.user;

    const {imageStr, description} = req.body;

    const options = {
        folder: process.env.CLOUDINARY_FOLDER + "/user/gallery",
        unique_filename: true
    };

    const uploadedImg = await cloudinary.uploader.upload(imageStr, options);

    const content = {
        id: mongoose.Types.ObjectId(),
        url: uploadedImg.url,
        description,
        date: {
            createdAt: new Date().toISOString(),
            updatedAt: null
        }
    };

    Profile.findOneAndUpdate(
        {accountId: id},
        {$push: {gallery: content}},
        {new: true, upsert: true}
    )
        .then((value) => {
            if (!value) return res.status(400).json({message: "_id not found"});
            return res.status(200).json(value);
        })
        .catch((err) => res.status(400).json(err));
});

const updateProfileGallery = async (req, res) => {
    try {
        const {accountId, description} = req.body;
        const filePath = req.file.path;
        const options = {
            folder: process.env.CLOUDINARY_FOLDER + "/user/gallery",
            unique_filename: true
        };
        const uploadedImg = await cloudinary.uploader.upload(filePath, options);
        const content = {
            id: mongoose.Types.ObjectId(),
            url: uploadedImg.url,
            description,
            date: {
                createdAt: new Date().toISOString(),
                updatedAt: null
            }
        };
        Profile.findOneAndUpdate(
            {accountId},
            {$push: {gallery: content}},
            {new: true, upsert: true}
        )
            .then((value) => {
                if (!value)
                    return res.status(400).json({message: "_id not found"});
                return res.status(200).json(value);
            })
            .catch((err) => res.status(400).json(err));
    } catch (error) {
        console.log(error);
    }
};
const deleteInProfileGallery = async (req, res) => {
    try {
        const {accountId, _id} = req.body;
        return Profile.findOneAndUpdate(
            {accountId},
            {$pull: {gallery: {id: mongoose.Types.ObjectId(_id)}}},
            {new: true}
        )
            .then((value) => res.status(200).json(value))
            .catch((err) => res.status(400).json(err.errors));
    } catch (error) {
        console.error(error);
    }
};
const updateProfileLink = async (req, res) => {
    const {accountId, content} = req.body;
    content.id = mongoose.Types.ObjectId();

    Profile.findOneAndUpdate(
        {accountId},
        {$push: {links: content}},
        {new: true, upsert: true}
    )
        .then((value) => {
            if (!value)
                return res.status(400).json({message: "accountId not found"});
            return res.status(200).json(value);
        })
        .catch((err) => res.status(400).json(err));
};
const deleteProfileLink = async (req, res) => {
    try {
        const {accountId, _id} = req.body;
        return Profile.findOneAndUpdate(
            {accountId},
            {$pull: {links: {id: mongoose.Types.ObjectId(_id)}}},
            {new: true}
        )
            .then((value) => res.status(200).json(value))
            .catch((err) => res.status(400).json(err.errors));
    } catch (error) {
        console.error(error);
    }
};
const deleteProfile = async (req, res) => {
    try {
        const accountId = req.params.id;
        return Profile.findOneAndRemove({accountId})
            .then(() => res.status(200).json({message: "success"}))
            .catch(() => res.status(400).json({message: "failed"}));
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    createProfile,
    getAllProfiles,
    getProfile,
    updateProfile,
    updateProfileVisibility,
    updateProfileAddress,
    updateProfileAvatar,
    updateProfileGallery,
    updateProfileLink,
    deleteProfile,
    deleteProfileLink,
    deleteInProfileGallery,
    uploadAvatar,
    uploadGallery
};
