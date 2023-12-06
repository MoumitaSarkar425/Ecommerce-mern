const ErrorHandler = require("../utils/errorhander");

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";


    ///wrong  mongo db id error
    if(err.name === 'CastError'){
        const message = `Resource Not Found: ${err.path}`;
        err = new ErrorHandler(message,400);
    }

    //mongoosee duplicate key error

    if(err.code === 11000 ){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered.`
        err = new ErrorHandler(message,400);
    }

    ///wrong  Json web token error
    if(err.name === 'JsonWebTokenError'){
        const message = `Json web token is invalid, try again.`;
        err = new ErrorHandler(message,400);
    }

    ///wrong  Json web token error
    if(err.name === 'TokenExpiredError'){
        const message = `Json web token is expired, try again.`;
        err = new ErrorHandler(message,400);
    }

    res.status(err.statusCode).json({
        success : false,
        message : err.message
    });
}