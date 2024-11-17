const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobile: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user', // Default role
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

module.exports = mongoose.model('User', userSchema);
