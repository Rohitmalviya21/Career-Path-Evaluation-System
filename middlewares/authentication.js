const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

const authenticate = async (req, res, next) => {
    try {
        const token = req.session.token; // Assuming token is stored in the session
        if (!token) {
            return res.redirect('/api/users/login'); // Redirect to login if not authenticated
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.redirect('/api/users/login'); // Redirect to login if user not found
        }

        req.user = user; // Attach user data to the request
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.redirect('/api/users/login'); // Redirect to login on error
    }
};

const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send('Access denied'); // Forbidden
        }
        next();
    };
};

module.exports = { authenticate, authorize };
