import { ApiError } from '../utils/apiError.js';

const errorHandler = (err, req, res, next) => {
    // If it's an ApiError, handle it properly
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || []
        });
    }

    // For other errors, log them and send a generic response
    console.error('Unhandled error:', err);
    
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: []
    });
};

export { errorHandler };
