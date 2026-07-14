const express = require('express');
const route = express.Router();

const adminController = require('../controller/adminController');
const Admin = require('../models/adminModel');
const passport = require('passport');
const auth = require('../config/auth');

const role = require('../config/roleMiddleware');

route.get('/',auth.checkAuth,role.checkRole('Super Admin' , 'Admin' , 'Employee' , 'Manager' , 'Editor' ),adminController.dashboardPage);

route.get('/add-admin',auth.checkAuth ,role.checkRole('Super Admin' , 'Admin' ),adminController.addAdminPage);

route.get('/view-admin',auth.checkAuth,role.checkRole('Super Admin' , 'Admin'),   adminController.viewAdminPage);

route.get('/signup', adminController.signupPage);

route.post('/register', adminController.registerPage);

route.get('/login', adminController.loginPage);

route.post('/login', (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {

        if (err) {
            return next(err);
        }

        if (!user) {
            req.flash('error', 'Invalid Email or Password');
            return res.redirect('/login');
        }

        req.logIn(user, (err) => {

            if (err) {
                return next(err);
            }

            req.flash('success', 'Login Successfully!');
            return res.redirect('/');

        });

    })(req, res, next);

});
route.get('/logout', adminController.logout);

route.get('/forgetPassword', adminController.forgetPasswordPage);

route.post('/sendOTP', adminController.sendOTP);

route.get('/verifyOTP', adminController.verifyOTPPage);

route.post('/verifyOTP', adminController.verifyOTP);

route.get('/newPassword', adminController.newPasswordPage);

route.post('/changeForgotPassword', adminController.changeForgotPassword);

route.get('/resetPassword', adminController.resetPasswordPage);

route.post('/updatePassword', auth.checkAuth,role.checkRole('Super Admin' , 'Admin' ), adminController.updatePassword);

route.get('/edit-admin/:id', auth.checkAuth,role.checkRole('Super Admin' , 'Admin' ), adminController.editAdminPage);

route.get('/delete-admin/:id', auth.checkAuth,role.checkRole('Super Admin' , 'Admin' ), adminController.deleteAdmin);

route.get('/edit-profile',role.checkRole('Super Admin' , 'Admin' , 'Manager' , 'Employee' , 'Editor'), auth.checkAuth, adminController.editProfilePage);

route.post('/update-profile',auth.checkAuth,role.checkRole('Super Admin' , 'Admin' , 'Manager' , 'Employee' , 'Editor'),Admin.uploadImage,adminController.updateProfile);

route.post('/add-admin', auth.checkAuth, Admin.uploadImage, adminController.insertAdmin);

route.post('/update-admin/:id', auth.checkAuth, Admin.uploadImage, adminController.updateAdmin);

module.exports = route;
