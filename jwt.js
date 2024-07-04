const jwt = require('jsonwebtoken')

const jwtAuthMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({Error : 'Token not found'});
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({Error : 'Unauthorized'});
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    }
    catch(err) {
        console.log(err);
        res.status(401).json({Error : 'Invalid token'});
    }
}

const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn : 600});
}

module.exports = {jwtAuthMiddleware, generateToken};