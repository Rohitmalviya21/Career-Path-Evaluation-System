const User = require('../models/userModel');
const CareerPath = require("../models/careerPathModel")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/email');
const Course = require("../models/courseModel");
require('dotenv').config()

// User signup controller
const signUp = async (req, res) => {
    try {

        console.log("inside siuo")
        const { name, email, password, mobile } = req.body;
        console.log('Request Body:', req.body);  // Log the request body to ensure it's being received

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already registered');  // Set error flash message
            return res.redirect('/api/users/signup');  // Redirect back to signup page
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const newUser = new User({ name, email, password: hashedPassword, mobile });
            await newUser.save();
            req.flash('success', 'User registered successfully');  // Set success flash message
            console.log("inside siuo")
            res.redirect('/api/users/login');  // Redirect to login page
        } catch (error) {
            console.error('Error saving user:', error);
            req.flash('error', 'Error saving user to database');  // Set error flash message
            res.redirect('/api/users/signup');  // Redirect back to signup page
        }
    } catch (error) {
        console.error('Server error:', error);
        req.flash('error', 'Server error');  // Set error flash message
        res.redirect('/api/users/signup');  // Redirect back to signup page
    }
};

const adminPage = (req, res) => {
    res.render('admin.ejs')
}

const addAdminPageData = async (req, res) => {
    try {
        // Extract data from the form
        const { careerPath, careerField, specialization } = req.body;



      
        console.log(careerField)
        console.log(specialization)


        console.log(req.body)
        const syllabusArray = careerField?.syllabus ? careerField.syllabus.split(',') : [];
        const roadmapArray = specialization?.roadmap ? specialization.roadmap.split(',') : [];

        // Create a new Course document
        const newCourse = new Course({
            name: careerField.name,
            description: careerField.description,
            syllabus: syllabusArray,
            syllabus: syllabusArray,
            careerField: {
                name: specialization?.name,
                roadmap: roadmapArray
            }
        });

        // Save the Course document
        await newCourse.save();

        // Create a new Career Path document with a reference to the new course
        const newCareerPath = new CareerPath({
            name: careerPath?.name,
            description: careerPath?.description,
            courses: [newCourse._id]
        });

        // Save the Career Path document
        await newCareerPath.save();;

        // Redirect to the homepage or send a success message
        res.redirect('/');
    } catch (error) {
        console.error('Error adding career path:', error);
        res.status(500).send('Server Error');
    }
}


//Home page
const home = (req, res) => {
    res.render('home.ejs')
}

// User signup Page
const signupPage = (req, res) => {
    res.render('signup', {
        successMessage: req.flash('success'),
        errorMessage: req.flash('error')
    });
}


//user loginPage controller
const loginPage = (req, res) => {
    res.render('login.ejs');
}

// User login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'User not found');  // Flash error message
            return res.redirect('/api/users/login');  // Redirect back to the login page
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            req.flash('error', 'Invalid password');  // Flash error message
            return res.redirect('/api/users/login');  // Redirect back to the login page
        }

        // If login is successful, create a token and redirect
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        req.session.token = token;  // Store the token in session
        req.flash('success', 'Login successful');  // Flash success message
        return res.redirect('/api/users/career-guide');  // Redirect to the career guide page
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'Server error');  // Flash error message for server error
        res.redirect('/api/users/login');  // Redirect back to login page
    }
};

//Career Guid
const Career = async (req, res) => {
    try {
        // Fetch all CareerPath data from the database
        const careerPaths = await CareerPath.find();
        console.log(careerPaths)
        // Pass the careerPaths data to the view
        res.render("CarrerGuid.ejs", { careerPaths });
    } catch (error) {
        console.error("Error fetching career paths:", error);
        res.status(500).send("Internal Server Error");
    }
};

//Forget passwordPage

const forgotPasswordPage = (req, res) => {
    console.log("forgrt pass")
    res.render("forgetPassword.ejs");
}

// Forgot password controller
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 5000; // 5 Min
        await user.save();

        const resetURL = `http://localhost:3000/reset-password/${token}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            text: `You are receiving this email because you requested a password reset. Please click on the following link to reset your password: ${resetURL}`
        };
        console.log(user.email)
        console.log(process.env.EMAIL_USER);
        console.log(process.env.EMAIL_PASS)
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending email', error });
            }
            res.status(200).json({ message: 'Password reset email sent', info: info });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset password controller
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addAdminPageData, adminPage, Career, home, signUp, signupPage, login, loginPage, forgotPassword, forgotPasswordPage, resetPassword };
