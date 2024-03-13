const Errorhandler=require('../utils/errorHandler');

module.exports=(err,req,res,next)=>{
    err.statuscode=err.statuscode || 500;
    err.message=err.message || 'Internal server error';
    
    // mongodb error
     if(err.name==='CastError'){
        const message=`resource not found Invalid:${err.path}`;
        err=new Errorhandler(message,400);
     }

     if(err.code===11000){
        const message=`Duplicate ${Object.keys(err.keyValue)} entered`;
         err=new Errorhandler(message,400);
     }

     if(err.name==="jsonWebTokenError"){
        const message=`json web token is Invalid try again`;
         err=new Errorhandler(message,400);
     }
     if(err.name==="tokenExpiredError"){
        const message=`json web token is expired ,try again`;
         err=new Errorhandler(message,400);
     }

    res.status(err.statuscode).json({
        success:false,
        message:err.message,
    })
}