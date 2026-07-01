const express = require('express');
const route = express.Router();

const adminController = require('../controller/adminController');
const Admin = require('../models/adminModel');
const passport = require('passport');
const auth = require('../config/auth');

// const checkAuth = async (req, res, next) => {
//     try {
//         if (!req.cookies.userData) {
//             return res.redirect('/signup');
//         }

//         const user = await Admin.findById(req.cookies.userData);

//         if (!user) {
//             res.clearCookie('userData');
//             return res.redirect('/signup');
//         }

//         req.user = user;
//         res.locals.user = user;

//         next();

//     } catch (err) {
//         console.log(err);
//     }
// }

route.get('/',auth.checkAuth,adminController.dashboardPage);

route.get('/add-admin',auth.checkAuth,adminController.addAdminPage);

route.get('/view-admin',auth.checkAuth,adminController.viewAdminPage);

// pages
// route.get('/', checkAuth, adminController.dashboardPage);
route.get('/signup', adminController.signupPage);
route.post('/register', adminController.registerPage);
route.get('/login', adminController.loginPage);
// route.post('/login', adminController.loginUser);
route.post('/login',passport.authenticate('local', {
     successRedirect: '/',failureRedirect: '/login'
    })

);
route.get('/logout', adminController.logout);
route.get('/forgetPassword', adminController.forgetPasswordPage);
// route.get('/add-admin', checkAuth, adminController.addAdminPage);
// route.get('/view-admin', checkAuth, adminController.viewAdminPage);
route.get('/edit-admin/:id', auth.checkAuth, adminController.editAdminPage);
route.get('/delete-admin/:id', auth.checkAuth, adminController.deleteAdmin);
route.get('/edit-profile', auth.checkAuth, adminController.editProfilePage);
route.post(
    '/update-profile',
    auth.checkAuth,
    Admin.uploadImage,
    adminController.updateProfile
);
route.post('/add-admin', auth.checkAuth, Admin.uploadImage, adminController.insertAdmin);
route.post('/update-admin/:id', auth.checkAuth, Admin.uploadImage, adminController.updateAdmin);

module.exports = route;
