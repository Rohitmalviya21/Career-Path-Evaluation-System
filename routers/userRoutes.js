const express = require('express');
const {  Career,signUp, signupPage, login, loginPage, forgotPassword,home, resetPassword, forgotPasswordPage } = require('../controllers/userControllers');

const router = express.Router();
router.get('',home)

router.route('/signup')
    .get(signupPage)
    .post(signUp);

router.route('/login')
    .get(loginPage)
    .post(login);
router.route("/career-guide").get(Career)
router.route('/forgot-password')
    .get(forgotPasswordPage)
    .post(forgotPassword);
    
router.post('/reset-password/:token', resetPassword);

module.exports = router;
