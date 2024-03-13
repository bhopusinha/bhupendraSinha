const sendToken=(user,statuscode,res)=>{

    const token=user.jwtToken();

    const options={
        expiresIn:new Date(
            Date.now() * process.env.SECRET_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly:true,
    }

    res.status(statuscode).cookie("token",token,options).json({
        success:true,
        user,
        token
    })
}

module.exports=sendToken;