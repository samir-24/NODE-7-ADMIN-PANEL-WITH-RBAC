const Admin = require('../models/adminModel');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const role = require('../config/roleMiddleware');

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





// module.exports.loginUser = async (req, res) => {
//     try {
//         let user = await Admin.findOne({
//             email: req.body.email
//         });

//         if (!user) {
//             console.log("Invalid Email");
//             return res.redirect('/login');
//         }
//         let matchPassword = await bcrypt.compare(
//             req.body.password, user.password
//         );

//         if (!matchPassword) {
//             console.log("Password Incorrect");
//             return res.redirect('/login');
//         }
//         res.cookie('userData', user._id, {
//             maxAge: 1000 * 60 * 60 * 24,
//             httpOnly: true
//         });
//         console.log("Login SuccessFully");
//         return res.redirect('/')
//     }
//     catch (err) {
//         console.log(err);
//     }
// }


// module.exports.logout = (req, res) => {
//     res.clearCookie('userData');
//     return res.redirect('/login');
// }

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