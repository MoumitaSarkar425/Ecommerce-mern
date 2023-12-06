const User = require('../models/userModel')
const catchAsyncErros = require("../middleware/catchAsyncError");
const ErrorHander = require('../utils/errorhander');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
//create User Registration

exports.registerUser =catchAsyncErros(
    async(req,res,next)=>{
        const {name,email,password} = req.body;
        const user = await User.create({
            name,email,password,avatar:{
                public_id:'this is a sample ',
                url:"profilepicurl"
            }
       })

       sendToken(user,201,res);
    }
);

exports.loginUsers =  catchAsyncErros(
    async(req,res,next)=>{
        const {email,password} = req.body;

        //checking if user have given email and password both 

        if(!email || !password){
            return next(new ErrorHander("Please enter email & password ",400))
        }

        const user =await User.findOne({email}).select("+password");

        if(!user){
            return next(new ErrorHander("Invalid email or password",401));
        }

        const isPasswordMatched =await user.comparePassword(password);

        if(!isPasswordMatched){
            return next(new ErrorHander("Invalid email or password",401));
        }

       

        sendToken(user,200,res);

    }
);

exports.logout = catchAsyncErros(
    async(req,res,next)=>{
        res.cookie('token',null ,{
            expires: new Date(Date.now()),
            httpOnly: true,
        })

        res.status(200).json({
            success:true,
            message:"logged out successfully."
       
        })
});

//Forgot Password 
exports.forgotPassword = catchAsyncErros(async(req,res,next)=>{
    const user =await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHander("User not found",404));
    }

    //Get ResetPassword Token

    const resetToken =await user.getResetPasswordToken();
    await user.save({ validateBeforeSave:false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    console.log(resetToken);

    const message = `Your password reset token is:- \n\n ${resetPasswordUrl} \n\n If you are not requested this 
    email then, please ignore it. `;

    try {
        
        await sendEmail({
            email: user.email,
            subject : `Ecommerce password recovery`,
            message
        });

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully.`
       
           })

    } catch (error) {
        // user.resetPasswordToken = undefined;
        // user.resetPasswordExpire = undefined;

        // await user.save({ validateBeforeSave:false });
        return next(new ErrorHander(error.message,500));
    }
})

//Reset Password 
exports.resetPassword = catchAsyncErros(async(req,res,next)=>{

    console.log(req.params.token);
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const resetPasswordExpire =  Date.now() + 15*60*1000;

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt:Date.now() }
        
    })

    if(!user){
        return next(new ErrorHander("Reset Password Token is invalid or has been expired",400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHander("Password does not matched",400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user,200,res);

});


// getUserDetails 

exports.getUserDetails = catchAsyncErros(async(req,res,next)=>{
    let user = await User.findById(req.user.id)
    
    res.status(200).json({
        success:true,
        user
    
    })

});

// updatePassword 

exports.updatePassword = catchAsyncErros(async(req,res,next)=>{
    let user = await User.findById(req.user.id).select("+password");
    
    const isPasswordMatched =await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHander("Old password is incorrect",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHander("Password doesn't matched",400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user,200,res);

});

// updateUserProfile 

exports.updateProfile = catchAsyncErros(async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false

    })

    res.status(200).json({
        success:true,    
    })
})


// get all users  (admin) 

exports.getAllUsers = catchAsyncErros(async(req,res,next)=>{
    let users = await User.find()
    
    res.status(200).json({
        success:true,
        users
    
    })

});


// get Single user  

exports.getSingleUser = catchAsyncErros(async(req,res,next)=>{
    let user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHander(`User does not exsist with id:${req.params.id}`,404));
    }
    
    res.status(200).json({
        success:true,
        user
    
    })

});


// updateUserRole -- Admin

exports.updateRole = catchAsyncErros(async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false

    })

    res.status(200).json({
        success:true,    
    })
})


// delete User -- Admin

exports.deleteUser = catchAsyncErros(async(req,res,next)=>{
   

    let user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHander(`User does not exsist with id:${req.params.id}`,404));
    }

    await user.remove();

    res.status(200).json({
        success:true,    
    })
})