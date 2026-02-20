import ErrorHandler from '../utils/errorHandler.js';

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Wrong Mongoose Object ID Error
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Handling Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(value => value.message);
        err = new ErrorHandler(message, 400);
    }

    // Handling duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const message = `Duplicate ${field} entered. Please use another ${field}`;
        err = new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid Token. Please try again';
        err = new ErrorHandler(message, 400);
    }

    // JWT Expire error
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired. Please login again';
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
};

export default errorMiddleware;