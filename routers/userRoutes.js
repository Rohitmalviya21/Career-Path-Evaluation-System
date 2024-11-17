const express = require('express');
const {
    about,
    contact,
    addAdminPageData,
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

// Protected Routes for Authenticated Users
router.get('/career-guide', authenticate, Career);
router.get('/career/:id',authenticate,course);
router.get('/about', authenticate, about);
router.get('/contact', authenticate, contact);

// Admin-Only Routes
router.route('/admin')
    .get(authenticate, authorize(['admin']), adminPage)
    .post(authenticate, authorize(['admin']), addAdminPageData);

// router.route('/admin/msg')
//     .get(authenticate, authorize(['admin']), adminMsg)
//     .post(authenticate, authorize(['admin']), addAdminMsg);

module.exports = router;
