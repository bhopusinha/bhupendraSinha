const mongoose =require('mongoose');
const validator=require('validator');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const crypto=require('crypto');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"pls enter your name"],
        maxlength:[30,"name cannot exceed 30 character"],
        minlength:[3,"name should more than 3 character"]
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:[validator.isEmail,"pls enter a valid email"],
    },
    password:{
        type:String,
        required:true,
        minlength:[8,"password should greater than 8 character"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        } 
    },
    role:{
        type:String,
        default:"user"
    },
    createdAt:{
        type:Date,
        default:Date.now
    },

    resetPasswordToken:String,
    resetPasswordExpire:Date
})

// bcrypt password
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
      next();
    }

    this.password=await bcrypt.hash(this.password,10);
})

// token create
userSchema.methods.jwtToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}

// compare password
userSchema.methods.isPassword=async function(enterpassword){
    return await bcrypt.compare(enterpassword,this.password) ;
}

// reset password token
userSchema.methods.getresetPasswordtoken=function(){

    const resetToken=crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).
       digest('hex');

    // console.log(this.resetPasswordToken);   

    this.resetPasswordExpire=Date.now() + 15*60*1000;
    
    return resetToken;
}


module.exports=new mongoose.model('User',userSchema);