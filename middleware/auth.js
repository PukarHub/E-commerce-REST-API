const jwt = require('jsonwebtoken');

require('dotenv').config();

module.exports = function(req,res,next) {
    // Get Token from the Header
    const token = req.header('x-auth-token');
    const secret = process.env.SECRET;

    // Check if not token
    if(!token) {
        return res.status(401).json({ message: 'No Token, authorization denied'});
    }
    
    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded.user;
        console.log('Am i admin?', req.user.isAdmin);
        if (!req.user.isAdmin)
        return res.status(401).send({ msg: "Not an admin, sorry" });
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid'});
    }
}

