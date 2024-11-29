const errorMiddleware = (err, req, resp, next) => {
    // Default error properties
    err.message ||= "Internal server error";
    err.statusCode ||= 500;

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
        err.message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
        err.statusCode = 400;
    }

    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
        err.message = `Duplicate field value: ${Object.keys(err.keyPattern).join(", ")}`;
        err.statusCode = 400;
    }

    // Handle Mongoose cast errors (invalid ObjectId, etc.)
    if (err.name === "CastError") {
        err.message = `Invalid format for ${err.path}`;
        err.statusCode = 400;
    }

    // Handle email sending errors
    if (err.message && err.message.includes("Failed to send email")) {
        err.statusCode = 500;
        err.message = "Email service is currently unavailable. Please try again later.";
    }

    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        err.message = "Invalid token. Please log in again.";
        err.statusCode = 401;
    }

    if (err.name === "TokenExpiredError") {
        err.message = "Your token has expired. Please log in again.";
        err.statusCode = 401;
    }

    // Handle specific Node.js errors
    if (err.code === "ECONNREFUSED") {
        err.message = "Service unavailable. Please try again later.";
        err.statusCode = 503;
    }

    // Handle specific rate-limiting errors
    if (err.statusCode === 429) {
        err.message = "Too many requests. Please try again later.";
    }

    return resp.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};


const catchAsyncError = (theFunction) => {
    return (req, resp, next) => {
        Promise.resolve(theFunction(req, resp, next)).catch((err) => {
            console.error("Error caught in catchAsyncError:", err);
            next(err);
        });
    };
};


export { errorMiddleware, catchAsyncError }