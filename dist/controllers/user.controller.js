import { User } from "../models/user.model.js";
import { TryCatch } from "../middlewares/error.middleware.js";
import ErrorHandler from "../utils/errorHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
export const newUser = TryCatch(async (req, res, next) => {
    const { name, email, role, googlePhoto, gender, _id, dob } = req.body;
    const photo = req.file;
    if (!photo && !googlePhoto) {
        return next(new ErrorHandler("Photo is required", 401));
    }
    if (!_id || !name || !email) {
        return next(new ErrorHandler("All fields are required", 401));
    }
    let cloudPhoto;
    if (photo) {
        cloudPhoto = await uploadOnCloudinary(photo.path);
    }
    let user = await User.findById(_id);
    if (user)
        return res.status(200).json({
            success: true,
            message: `Welcome, ${user.name}`,
        });
    if (!gender && !dob) {
        user = await User.create({
            name,
            email,
            photo: googlePhoto,
            _id,
            role
        });
    }
    else {
        user = await User.create({
            name,
            email,
            photo: cloudPhoto?.url,
            gender,
            role,
            _id,
            dob: new Date(dob),
        });
    }
    return res.status(201).json({
        success: true,
        message: `Welcome, ${user.name}`,
    });
});
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        users,
    });
});
export const getUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 400));
    return res.status(200).json({
        success: true,
        user,
    });
});
export const deleteUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 400));
    await user.deleteOne();
    return res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
});
