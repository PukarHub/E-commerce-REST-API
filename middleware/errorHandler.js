function errorHandler(err,req,res,next) {
    if(err.name === 'UnauthorizedError') {
        // Jwt Authentication Error
        return res.status(401).json({ message: 'The User is Not Authorized'});
    }

    if(err.name === 'ValidationError'){
        // Validation Error
        return res.status(401).json({ message: err});
    }

    // Default to 500 server error
    return res.status(500).json(err);
}

module.exports = errorHandler;