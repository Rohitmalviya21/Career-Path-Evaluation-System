const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/email');
let CareerPath = require("../models/careerPathModel")
let Course = require("../models/courseModel")
let CareerField = require("../models/careerFiled")
require('dotenv').config();

// User signup controller
const signUp = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email is already registered. Please log in or use a different email.');
            return res.redirect('/api/users/signup');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, mobile });
        await newUser.save();
        req.flash('success', 'Registration successful! Please log in to continue.');
        res.redirect('/api/users/login');
    } catch (error) {
        console.error('Error during signup:', error);
        req.flash('error', 'Unexpected error during registration. Please try again.');
        res.redirect('/api/users/signup');
    }
};

// Admin page
const adminPage = (req, res) => {
    req.flash('info', 'Welcome to the Admin Dashboard');
    res.render('admin.ejs', { successMessage: req.flash('success'), errorMessage: req.flash('error') });
};


// Home page
const home = (req, res) => {
    res.render('home.ejs', { successMessage: req.flash('success'), errorMessage: req.flash('error') });
};

// User signup Page
const signupPage = (req, res) => {
    res.render('signup', {
        successMessage: req.flash('success'),
        errorMessage: req.flash('error')
    });
};

// User login Page
const loginPage = (req, res) => {
    res.render('login.ejs', {
        successMessage: req.flash('success'),
        errorMessage: req.flash('error')
    });
};

// User login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Account does not exist. Please sign up.');
            return res.redirect('/api/users/login');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            req.flash('error', 'Incorrect password. Please try again.');
            return res.redirect('/api/users/login');
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        req.session.token = token;
        req.session.role = user.role;
        req.flash('success', 'Login successful!');
        res.redirect(user.role === 'admin' ? '/api/users/admin' : '/api/users/career-guide');
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'Unexpected error during login. Please try again.');
        res.redirect('/api/users/login');
    }
};

// Logout controller
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            // req.flash('error', 'Logout failed. Please try again.');
            return res.redirect('/');  // Make sure this isn't causing an issue
        }
        // req.flash('success', 'You have logged out successfully!');
        res.redirect('/api/users/');  // Redirect after session is destroyed
    });
};



// Forgot Password Page
const forgotPasswordPage = (req, res) => {
    res.render("forgetPassword.ejs", { errorMessage: req.flash('error') });
};

// Forgot password controller
const forgotPassword = async (req, res) => {
    console.log("ganesh")

    try {
        const { email } = req.body;
        console.log(email)
        const user = await User.findOne({ email });

        if (!user) {
            req.flash('error', 'User not found. Please check your email address.');
            return res.redirect('/api/users/forgot-password');
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 300000; // 5 Minutes
        await user.save();

        const resetURL = `http://localhost:3000/reset-password/${token}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            text: `Click this link to reset your password: ${resetURL}`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.log("err", error)
                req.flash('error', 'Failed to send password reset email.');
                return res.redirect('/api/users/forgot-password');
            }
            req.flash('success', 'Password reset email sent successfully!');
            res.redirect('/api/users/login');
        });
    } catch (error) {
        console.error('Error during forgot password:', error);
        req.flash('error', 'Unexpected error. Please try again.');
        res.redirect('/api/users/forgot-password');
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
            req.flash('error', 'Invalid or expired password reset token.');
            return res.redirect('/api/users/forgot-password');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash('success', 'Password reset successful! Please log in.');
        res.redirect('/api/users/login');
    } catch (error) {
        console.error('Error resetting password:', error);
        req.flash('error', 'Failed to reset password. Please try again.');
        res.redirect('/api/users/forgot-password');
    }
};

// About page
const about = (req, res) => {
    res.render("about.ejs", { infoMessage: req.flash('info') });
};

// Contact page
const contact = (req, res) => res.render('contact.ejs');



const addCareerPath = async (req, res) => {
    try {
        console.log(req.body)
        const { careerPathId, name, description } = req.body;
        const careerPath = new CareerPath({ careerPathId, name, description });
        await careerPath.save();
        console.log("yes-careePath")
        res.redirect("/api/users/admin")
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding Career Path.');
    }
}

const addCourse = async (req, res) => {
    try {
        console.log(req.body)
        const { careerPathId, courseId, name, description } = req.body;
        const course = new Course({ courseId, name, description });
        await course.save();

        // Link course to the career path
        await CareerPath.updateOne(
            { careerPathId },
            { $push: { courses: course._id } }
        );

        console.log("yes-Courses")
        res.redirect("/api/users/admin")
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding Course.');
    }
}

const addCareerField = async (req, res) => {
    try {
        console.log(req.body)
        const { courseId, name, description, skills, avgSalary, demand, links } = req.body;
        const careerField = new CareerField({
            name,
            description,
            skills: skills ? skills.split(',') : [],
            avgSalary,
            demand
            ,
            links:links ? links.split(',') : [],
        });
        await careerField.save();

        console.log("yesfilrf")
        // Optionally link to the course (if applicable)
        await Course.updateOne(
            { courseId },
            { $push: { relatedCourses: careerField._id } }
        );


        res.redirect("/api/users/admin")
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding Career Field.');
    }
}
// Career Guide
const Career = async (req, res) => {
    try {
        const careerPaths = await CareerPath.find();
        res.render("CarrerGuid.ejs", { careerPaths });
    } catch (error) {
        console.error("Error fetching career paths:", error);
        req.flash('error', 'Unable to fetch career paths. Please try again later.');
        res.redirect('/');
    }
};

const course = async (req, res) => {
    try {
        // Find career path by ID and populate the courses
        const careerPath = await CareerPath.findById(req.params.id).populate('courses');
        if (!careerPath) {
            return res.status(404).json({ message: 'Career Path not found' });
        }
        res.render('course.ejs', { careerPath }); // Render a view to display the career path and courses
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const relatedFiled = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId).populate('relatedCourses');

        console.log(courseId)
        console.log(course, course)

        if (!course) {
            return res.status(404).send('Course not found');
        }
        res.render('relatedFiled.ejs', { relatedCourses: course.relatedCourses });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {
    relatedFiled,
    addCareerPath, addCourse, addCareerField,
    logout, contact, about, adminPage, Career, home, course,
    signUp, signupPage, login, loginPage, forgotPassword, forgotPasswordPage, resetPassword
};
