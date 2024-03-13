const Errorhandler = require('../utils/errorHandler');
const catchAsyncerror = require('../middleware/catchAsyncerror');
const User = require('../models/userModels');
const sendToken = require('../utils/jsonToken');
const sendEmail = require('../utils/sendEmail.js');
const crypto = require('crypto');
const cloudinary = require('cloudinary');

// register
exports.userRegister = catchAsyncerror(
    async (req, res, next) => {
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale"
        })
        const { name, email, password } = req.body;
        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        })

        sendToken(user, 201, res);
    }
)

exports.loginUser = catchAsyncerror(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new Errorhandler('please enter email and password', 400));
    }

    const user = await User.findOne({ email: email }).select("+password");
    if (!user) {
        return next(new Errorhandler('Invalid email and password', 400));
    }

    const isMatchPassword = await user.isPassword(password);

    if (!isMatchPassword) {
        console.log("notMatch");
        return next(new Errorhandler('Invalid email and password', 401));
    }

    sendToken(user, 200, res);
})

exports.logOut = catchAsyncerror(
    async (req, res, next) => {

        res.cookie("token", null, {
            expiresIn: new Date(Date.now()),
            httpOnly: true
        })


        res.status(200).json({
            success: true,
            message: "user logged Out"
        })
    }
)

exports.forgotPassword = catchAsyncerror(
    async (req, res, next) => {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return next(new Errorhandler('user not found', 404));
        }

        const resetToken = user.getresetPasswordtoken();

        await user.save({ validateBeforeSave: false });

        const resetPasswordurl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`

        const message = `your reset password token is :- \n\n ${resetPasswordurl} \n\n if you have not requested
        this email then, please ignore it `;


        try {

            await sendEmail({
                email: user.email,
                subject: "Ecommerce password recovery",
                message
            })

            res.status(200).json({
                success: true,
                message: "Email send successfully!"
                //  message:`message sent to ${user.email} successfully the token is ${message} `
            })

        } catch (e) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return next(new Errorhandler(err.message, 500));
        }
    }
)


// reset Password
exports.resetPassword = catchAsyncerror(
    async (req, res, next) => {

        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).
            digest('hex');

        // console.log(resetPasswordToken);

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        })

        if (!user) {
            return next(new Errorhandler('reset password token is invalid or has been expired', 400));
        }

        if (req.body.password !== req.body.confirmPassword) {
            return next(new Errorhandler('password and confirm password should be same ', 400));
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendToken(user, 200, res);

    }

)

exports.getUserDetail = catchAsyncerror(async (req, res, next) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})


exports.updateUserPassword = catchAsyncerror(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password");

    const isMatchPassword = await user.isPassword(req.body.oldPassword);
    if (!isMatchPassword) {
        return next(new Errorhandler('Incorrect password !', 401));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new Errorhandler('password and confirm password should be same', 401));
    }

    user.password = req.body.password;

    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);

})

exports.userUpdate = catchAsyncerror(async (req, res, next) => {


    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id);

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);
    }

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale"
    });

    const newUpdate = {
        name: req.body.name,
        email: req.body.email,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUpdate, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    await user.save();

    res.status(200).json({
        success: true
    })
})


// get all user(admin)
exports.getallUser = catchAsyncerror(async (req, res, next) => {

    const user = await User.find();

    res.status(200).json({
        success: true,
        user
    })
})

// get single user(admin)
exports.getSingleUser = catchAsyncerror(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new Errorhandler(`user does not exist with this id: ${req.params.id}`));
    }

    res.status(200).json({
        success: true,
        user
    })
})


// update user role --admin
exports.userRoleUpdate = catchAsyncerror(async (req, res, next) => {
    const newUpdate = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUpdate, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    await user.save();

    res.status(200).json({
        success: true
    })
})

// for delete user --admin
exports.userDelete = catchAsyncerror(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    // we will remove cloudery

    if (!user) {
        return next(new Errorhandler(`user does not exist with this id: ${req.params.id}`));
    }

    const avatarId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(avatarId);

    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        message: "user deleted successfully !"
    })
})


