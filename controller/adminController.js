const Admin = require('../models/adminModel');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const role = require('../config/roleMiddleware');
const transporter = require("../config/emailConfig");
const crypto = require("crypto");   

const deleteAdminAvatar = (avatar) => {
    if (!avatar) {
        return;
    }

    const imagePath = path.join(__dirname, '..', 'public', avatar.replace(/^\//, ''));

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully");
    } else {
        console.log("Image not found, skipping delete");
    }
}

module.exports.signupPage = (req, res) => {
    try {
        return res.render('signup');
    }
    catch (err) {
        console.log(err);
    }
}

module.exports.registerPage = async (req, res) => {
    try {
        let checkEmail = await Admin.findOne({
            email: req.body.email
        });

        if (checkEmail) {
            console.log("User Already Exist");
            req.flash("error", "User already exists!");
            return res.redirect('/login');
        }

        let hashPassword = await bcrypt.hash(req.body.password, 10);

        req.body.password = hashPassword;

        await Admin.create(req.body);

        console.log("SignUp Successfully...!");
        req.flash("success", "Signup Successfully!");

        return res.redirect('/login');

    }
    catch (err) {
        console.log(err);
        req.flash("error", "Signup failed!");
    }
}

module.exports.loginPage = (req, res) => {
    try {

        return res.render('login');
    }
    catch (err) {
        console.log(err);
    }
}

module.exports.forgetPasswordPage = (req, res) => {
    try {
        return res.render('forget-password');
    }
    catch (err) {
        console.log(err);
    }
}


module.exports.resetPasswordPage = (req, res) => {
    try {
        return res.render('reset-password');
    }
    catch (err) {
        console.log(err);
    }
}

module.exports.updatePassword = async (req, res) => {
    try {

        // Get logged in user
        const userData = await Admin.findById(req.user._id);

        if (!userData) {
            req.flash("error", "User not found!");
            return res.redirect("/login");
        }

        // Check current password
        const matchPassword = await bcrypt.compare(
            req.body.currentPassword,
            userData.password
        );

        if (!matchPassword) {
            console.log("Incorrect Current Password");
            req.flash("error", "Current Password is incorrect!");
            return res.redirect("back");
        }

        // Check new password is not same as current password
        const samePassword = await bcrypt.compare(
            req.body.npass,
            userData.password
        );

        if (samePassword) {
            console.log("New Password cannot be same as Current Password");
            req.flash("error", "New Password cannot be same as Current Password!");
            return res.redirect("back");
        }

        // Check confirm password
        if (req.body.npass !== req.body.cpass) {
            console.log("Confirm Password does not match");
            req.flash("error", "Confirm Password does not match!");
            return res.redirect("back");
        }

        // Hash new password
        const hashPassword = await bcrypt.hash(req.body.npass, 10);

        // Update password
        await Admin.findByIdAndUpdate(req.user._id, {
            password: hashPassword
        });

        console.log("Password Changed Successfully");

        req.flash("success", "Password Changed Successfully!");

        // Logout user after password change
        req.logout(function (err) {

            if (err) {
                console.log(err);
                return res.redirect("back");
            }

            req.session.destroy(() => {
                return res.redirect("/login");
            });

        });

    } catch (err) {

        console.log(err);
        req.flash("error", "Something went wrong!");
        return res.redirect("back");

    }
};

module.exports.sendOTP = async (req, res) => {

    try {

        const { email } = req.body;

        const user = await Admin.findOne({ email });

        if (!user) {
            req.flash("error", "Email does not exist!");
            return res.redirect("back");
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        console.log("Generated OTP :", otp);

        // Hash OTP
        const hashOTP = await bcrypt.hash(otp, 10);

        // Save OTP & Expiry (5 minutes)
        user.otp = hashOTP;
        user.otpExpires = Date.now() + 5 * 60 * 1000;

        await user.save();

        // Save Email in Session
        req.session.resetEmail = email;

        // Send Email
        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: email,

            subject: "Password Reset OTP",

            html: `
                <h2>Password Reset OTP</h2>

                <p>Hello ${user.fname},</p>

                <h1>${otp}</h1>

                <p>This OTP is valid for only 5 minutes.</p>

                <br>

                <>Thank You.</>
            `

        });

        req.flash("success", "OTP sent successfully.");

        return res.redirect("/verifyOTP");

    }

    catch (err) {

        console.log(err);

        req.flash("error", "Failed to send OTP.");

        return res.redirect("back");

    }

}

module.exports.verifyOTPPage = (req, res) => {

    try {

        if (!req.session.resetEmail) {

            return res.redirect('/forgetPassword');

        }

        return res.render('verify-otp');

    }

    catch (err) {

        console.log(err);

    }

}

module.exports.verifyOTP = async (req, res) => {

    try {

        const { otp } = req.body;

        const email = req.session.resetEmail;

        if (!email) {

            req.flash("error", "Session Expired.");

            return res.redirect('/forgetPassword');

        }

        const user = await Admin.findOne({ email });

        if (!user) {

            req.flash("error", "User not found.");

            return res.redirect('/forgetPassword');

        }

        if (user.otpExpires < Date.now()) {

            req.flash("error", "OTP Expired.");

            return res.redirect('/forgetPassword');

        }

        const matchOTP = await bcrypt.compare(otp, user.otp);

        if (!matchOTP) {

            req.flash("error", "Invalid OTP");

            return res.redirect("back");

        }

        req.session.otpVerified = true;

        req.flash("success", "OTP Verified Successfully");

        return res.redirect('/newPassword');

    }

    catch (err) {

        console.log(err);

    }

}

module.exports.newPasswordPage = (req, res) => {

    try {

        if (!req.session.otpVerified) {

            req.flash("error", "Verify OTP First.");

            return res.redirect("/forgetPassword");

        }

        return res.render("new-password");

    }

    catch (err) {

        console.log(err);

    }

}

module.exports.changeForgotPassword = async (req, res) => {

    try {

        const { npass, cpass } = req.body;

        if (npass !== cpass) {

            req.flash("error", "Confirm Password does not match.");

            return res.redirect("back");

        }

        const email = req.session.resetEmail;

        const user = await Admin.findOne({ email });

        if (!user) {

            req.flash("error", "User not found.");

            return res.redirect("/forgetPassword");

        }

        const hashPassword = await bcrypt.hash(npass, 10);

        user.password = hashPassword;

        // Clear OTP
        user.otp = null;
        user.otpExpires = null;

        await user.save();

        // Destroy Session
        req.session.resetEmail = null;
        req.session.otpVerified = null;

        req.flash("success", "Password Changed Successfully.");

        return res.redirect("/login");

    }

    catch (err) {

        console.log(err);

    }

}

module.exports.logout = (req, res, next) => {

    req.logout(function (err) {

        if (err) {
            return next(err);
        }

        req.session.destroy(() => {

            return res.redirect('/login');

        });

    });

}

module.exports.dashboardPage = async (req, res) => {
    try {

        // let admin = await Admin.findById(req.cookies.userData);
        let admin = req.user;

        return res.render('dashboard', {
            admin
        });

    } catch (err) {
        console.log(err);
    }
}

module.exports.addAdminPage = (req, res) => {
    try {
        return res.render('add-admin');
    }
    catch (err) {
        console.log(err);
    }
}
module.exports.insertAdmin = async (req, res) => {
    try {
        if (req.file) {
            req.body.avatar = Admin.imagePath + '/' + req.file.filename;
        }
        req.body.password = await bcrypt.hash(req.body.password, 10);

        await Admin.create(req.body);
        console.log('ADMIN ADDED SUCCESSFULLY...!');
        req.flash("success", "Admin Added Successfully!");

        return res.redirect('/');
    }
    catch (err) {
        console.log(err);
        req.flash("error", "Failed to add admin!");
    }
}
module.exports.viewAdminPage = async (req, res) => {
    try {
        const adminData = await Admin.find();
        return res.render('view-admin', { adminData });
    }
    catch (err) {
        console.log(err);
    }
}

module.exports.editAdminPage = async (req, res) => {
    try {
        const id = req.params.id;

        const singleAdmin = await Admin.findById(id);

        if (!singleAdmin) {
            return res.send("Admin not found");
        }

        return res.render('edit-admin', { admin: singleAdmin });
    }
    catch (err) {
        console.log(err);
    }
}

module.exports.updateAdmin = async (req, res) => {
    try {
        const id = req.params.id;

        const oldAdmin = await Admin.findById(id);

        if (!oldAdmin) {
            req.flash("error", "Admin not found!");
            return res.redirect("/view-admin");
        }

        let avatar = oldAdmin.avatar;

        if (req.file) {
            deleteAdminAvatar(oldAdmin.avatar);
            avatar = Admin.imagePath + '/' + req.file.filename;
        }

        await Admin.findByIdAndUpdate(id, {
            fname: req.body.fname,
            lname: req.body.lname,
            uname: req.body.uname,
            email: req.body.email,
            mobile: req.body.mobile,
            dob: req.body.dob,
            gender: req.body.gender,
            hobby: req.body.hobby,
            city: req.body.city,
            role: req.body.role,
            address: req.body.address,
            avatar: avatar
        });

        req.flash("success", "Admin Updated Successfully!");
        return res.redirect('/view-admin');
    }
    catch (err) {
        console.log(err);
        req.flash("error", "Failed to update admin!");
    }
}

module.exports.deleteAdmin = async (req, res) => {
    try {
        const id = req.params.id;

        const singleAdmin = await Admin.findById(id);

        if (!singleAdmin) {
            req.flash("error", "Admin not found!");
            return res.send("Admin not found");
        }

        deleteAdminAvatar(singleAdmin.avatar);

        await Admin.findByIdAndDelete(id);

        req.flash("success", "Admin Deleted Successfully!");
        return res.redirect('/view-admin');
    }
    catch (err) {
        console.log(err);
        req.flash("error", "Failed to delete admin!");
    }
}

module.exports.editProfilePage = async (req, res) => {
    try {

        // let userData = await Admin.findById(req.cookies.userData);
        let userData = req.user;

        return res.render('edit-profile', {
            admin: userData
        });

    } catch (err) {
        console.log(err);
    }
}


// module.exports.updateProfile = async (req, res) => {
//     try {

//         // const oldData = await Admin.findById(req.cookies.userData);
//         const oldData = req.user;

//         if (req.file) {

//             if (oldData.avatar) {

//                 const imagePath = path.join(
//                     __dirname,
//                     "..",
//                     "public",
//                     oldData.avatar.replace(/^\//, "")
//                 );

//                 if (fs.existsSync(imagePath)) {
//                     fs.unlinkSync(imagePath);
//                 }
//             }

//             req.body.avatar = Admin.imagePath + "/" + req.file.filename;

//         } else {

//             req.body.avatar = oldData.avatar;
//         }

//         // await Admin.findByIdAndUpdate(
//         //     req.cookies.userData,
//         //     req.body,
//         //     { new: true }
//         // );
//         await Admin.findByIdAndUpdate(
//             req.user._id,
//             req.body,
//             { new: true }
//         );

//         console.log("Profile Updated Successfully");

//         return res.redirect("/");

//     } catch (err) {
//         console.log(err);
//     }
// }

module.exports.updateProfile = async (req, res) => {

    try {

        const oldData = await Admin.findById(req.user._id);

        if (!oldData) {
            req.flash("error", "User not found!");
            return res.redirect("/login");
        }

        let avatar = oldData.avatar;

        if (req.file) {

            if (oldData.avatar) {

                deleteAdminAvatar(oldData.avatar);

            }

            avatar = Admin.imagePath + "/" + req.file.filename;

        }

        await Admin.findByIdAndUpdate(req.user._id, {

            fname: req.body.fname,
            lname: req.body.lname,
            uname: req.body.uname,
            email: req.body.email,
            dob: req.body.dob,
            mobile: req.body.mobile,
            gender: req.body.gender,
            hobby: req.body.hobby,
            city: req.body.city,
            address: req.body.address,
            bio: req.body.bio,
            avatar: avatar

        });

        console.log("Profile Updated Successfully");
        req.flash("success", "Profile Updated Successfully!");

        return res.redirect("/");

    }

    catch (err) {

        console.log(err);
        req.flash("error", "Profile update failed!");
    }

}