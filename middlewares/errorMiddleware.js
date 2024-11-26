
const errorMiddleware = (err, req, resp, next) => {
    err.message ||= "Internal server error"
    err.statusCode ||= 500

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
        err.message
        err.statusCode = 400;
    }

    
    if (err.code === 11000) {
        err.message = `Duplicate  ${Object.keys(err.keyPattern).join(", ")}`
        err.statusCode = 400
    }

    if (err.name === "CastError") {
        err.message = `Invalid format of ${err.path}`
        err.statusCode = 400
    }



    return resp.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}

const catchAsyncError = (theFunction) => {
    return (req, resp, next) => {
        Promise.resolve(theFunction(req, resp, next)).catch(next)
    }
}

export { errorMiddleware, catchAsyncError }