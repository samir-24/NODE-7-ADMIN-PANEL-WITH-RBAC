const Category = require('../models/category');

const path = require('path');

const fs = require('fs');

const bcrypt = require('bcrypt');

const deleteCategoryImage = (imagePath) => {
    if (imagePath) {
        const fullPath = path.join(__dirname, "..", "public", imagePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
}

module.exports.addCategoryPage = (req, res) => {
    try {
        return res.render('add-category');
    }   
    catch (err) {
        console.log(err);
    }
}

module.exports.insertCategory = async (req, res) => {

    try {

        if (req.file) {
            req.body.categoryImage = Category.imagePath + "/" + req.file.filename;
        }

        await Category.create(req.body);

        console.log("CATEGORY ADDED SUCCESSFULLY...!");

        req.flash("success", "Category added successfully.");

        return res.redirect("/category/view-category");

    }
    catch (err) {
        console.log(err);
    }

}

// module.exports.viewCategoryPage = async (req, res) => {
//     try {

//         const page = parseInt(req.query.page) || 1;
//         const limit = 5;

//         const totalRecords = await Category.countDocuments({
//             isDeleted: false
//         });

//         const totalPages = Math.ceil(totalRecords / limit);

//         const categoryData = await Category.find({
//             isDeleted: false
//         })
//         .skip((page - 1) * limit)
//         .limit(limit);

//         return res.render("view-category", {
//             categoryData,
//             currentPage: page,
//             totalPages
//             limit
//         });

//     } catch (err) {
//         console.log(err);
//     }
// }
module.exports.viewCategoryPage = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const totalRecords = await Category.countDocuments({
            isDeleted: false
        });

        const totalPages = Math.ceil(totalRecords / limit);

        const categoryData = await Category.find({
            isDeleted: false
        })
        .skip((page - 1) * limit)
        .limit(limit);

        return res.render("view-category", {
            categoryData,
            currentPage: page,
            totalPages,
            limit          // 👈 pass limit
        });

    } catch (err) {
        console.log(err);
    }
}

module.exports.editCategoryPage = async (req, res) => {
    try {

        const id = req.params.id;

        const singleCategory = await Category.findById(id);

        if (!singleCategory) {
            return res.send("Category Not Found");
        }

        return res.render("edit-category", {
            category: singleCategory
        });

    } catch (err) {
        console.log(err);
    }
}

module.exports.updateCategory = async (req, res) => {
    try {

        const id = req.params.id;

        const oldCategory = await Category.findById(id);

        if (!oldCategory) {
            return res.send("Category Not Found");
        }

        let categoryImage = oldCategory.categoryImage;

        if (req.file) {

            deleteCategoryImage(oldCategory.categoryImage);

            categoryImage = Category.imagePath + "/" + req.file.filename;
        }

        await Category.findByIdAndUpdate(id, {

            categoryName: req.body.categoryName,

            categoryDescription: req.body.categoryDescription,

            categoryImage: categoryImage

        });

        req.flash("success", "Category Updated Successfully");

        return res.redirect("/category/view-category");

    } catch (err) {
        console.log(err);
    }
}
module.exports.changeStatus = async (req, res) => {
    try {

        const id = req.params.id;

        const singleData = await Category.findById(id);

        if (!singleData) {
            req.flash("error", "Category Not Found");
            return res.redirect("/category/view-category");
        }

        await Category.findByIdAndUpdate(id, {
            status: !singleData.status
        });

        req.flash("success", "Category Status Updated Successfully");

        return res.redirect("/category/view-category");

    } catch (err) {
        console.log(err);
        req.flash("error", "Something Went Wrong");
        return res.redirect("/category/view-category");
    }
};

module.exports.deleteCategory = async (req, res) => {
    try {

        const id = req.params.id;

        const category = await Category.findById(id);

        if (!category) {
            req.flash("error", "Category Not Found");
            return res.redirect("/category/view-category");
        }

        // Delete image
        deleteCategoryImage(category.categoryImage);

        // Soft Delete
        await Category.findByIdAndUpdate(id, {
            isDeleted: true
        });

        req.flash("success", "Category Deleted Successfully");

        return res.redirect("/category/view-category");

    } catch (err) {
        console.log(err);
        req.flash("error", "Something Went Wrong");
        return res.redirect("/category/view-category");
    }
};