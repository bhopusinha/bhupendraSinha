const Errorhandler = require("../utils/errorHandler");
const catchAsyncerror = require("./catchAsyncerror");
const User=require('../models/userModels');
const jwt=require('jsonwebtoken');


exports.isAuthenticate=catchAsyncerror(async(req,res,next)=>{
    const {token}=req.cookies;
   

    if(!token){
        return next(new Errorhandler('pls login to access this resource',400));
    }
    
    const decodedata=await jwt.verify(token,process.env.JWT_SECRET);

    req.user=await User.findById(decodedata.id); 
    next();
})

exports.isAutorize=(...roles)=>{
    return (req,res,next)=>{
       
       if(!roles.includes(req.user.role)){
        return next(new Errorhandler(`role ${req.user.role} cannot access this resource`,403));
       }
       
       next();
    }
}