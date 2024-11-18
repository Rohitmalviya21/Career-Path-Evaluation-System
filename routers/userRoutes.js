const express = require('express');

const {
    relatedFiled,
    addCareerField,
    addCourse,
    addCareerPath,
    about,
    contact,

    adminPage,
    Career,
    signUp,
    signupPage,
    login,
    loginPage,
    forgotPassword,
    home,
    resetPassword,
    forgotPasswordPage,
    logout, course
} = require('../controllers/userControllers');
const { authenticate, authorize } = require('../middlewares/authentication');


const router = express.Router();

// Public Routes
router.get('', home);

router.route('/signup')
    .get(signupPage)
    .post(signUp);

router.route('/login')
    .get(loginPage)
    .post(login);

router.route("/logout")
    .get(logout);

router.route('/forgot-password')
    .get(forgotPasswordPage)
    .post(forgotPassword);

router.post('/reset-password/:token', resetPassword);


router.get('/about', authenticate, about);
router.get('/contact', authenticate, contact);


// Protected Routes for Authenticated Users
router.get('/career-guide', authenticate, Career);

// Route: Add Career Path
router.post('/career-path', authenticate, authorize(['admin']), addCareerPath);

// Route: Add Course
router.post('/course', authenticate, authorize(['admin']), addCourse);

// Route: Add Career Field
router.post('/careerfield', authenticate, authorize(['admin']), addCareerField)

router.get('/career/:id', authenticate, course);

router.get('/course1/:id', relatedFiled);

// Admin-Only Routes
router.route('/admin')
    .get(authenticate, authorize(['admin']), adminPage)


module.exports = router;







