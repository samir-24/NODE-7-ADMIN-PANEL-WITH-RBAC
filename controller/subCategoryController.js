const Category = require('../models/category');

const SubCategory = require('../models/subCategoryModel');

const fs = require('fs');

module.exports.addSubCategoryPage = async (req, res) => {
    try{

        let categoryData = await Category.find({
            status : true
        }).sort({
            categoryName : 1
        })
        return res.render('add-subCategory',{
            categoryData,
            singleData : null
        })
    }
    catch{
        console.log(err);
    }
};

module.exports.viewSubCategoryPage = async (req, res) => {
    try{
        return res.render('view-subCategory',{
            singleData : null
        })
    }
    catch{
        console.log(err);
    }
};

module.exports.insertSubCategory = async (req, res) => {
    try {

        console.log("BODY:", req.body);

        await SubCategory.create({
            categoryId: req.body.categoryId,
            subCategoryName: req.body.subCategoryName,
            subCategoryDescription: req.body.subCategoryDescription
        });

        req.flash('success', 'Sub Category Added Successfully');
        return res.redirect('/subCategory/view-subCategory');

    } catch (err) {
        console.log(err);
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/subCategory/add-subCategory');
    }
};


module.exports.viewSubCategoryPage = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const totalRecords = await SubCategory.countDocuments({
            isDeleted: false
        });

        const totalPages = Math.ceil(totalRecords / limit);

        const subCategoryData = await SubCategory.find({
            isDeleted: false
        })
        .populate("categoryId")
        .skip((page - 1) * limit)
        .limit(limit);

        return res.render("view-subCategory", {
            subCategoryData,
            currentPage: page,
            totalPages,
            limit
        });

    } catch (err) {
        console.log(err);
    }
};
module.exports.changeStatus = async(req,res)=>{

    try{

        const id = req.params.id;

        const singleData = await SubCategory.findById(id);

        await SubCategory.findByIdAndUpdate(id,{
            status:!singleData.status
        });

        req.flash("success","Status Updated");

        return res.redirect("/subCategory/view-subCategory");

    }
    catch(err){

        console.log(err);

    }

}
module.exports.editSubCategoryPage = async (req, res) => {
    try {

        const id = req.params.id;

        const subCategory = await SubCategory.findById(id);

        const categoryData = await Category.find({ status: true });

        return res.render('edit-subCategory', {
            subCategory,
            categoryData
        });

    } catch (err) {
        console.log(err);
        return res.redirect('/subCategory/view-subCategory');
    }
};

module.exports.updateSubCategory = async (req, res) => {
    try {

        const id = req.params.id;

        await SubCategory.findByIdAndUpdate(id, {

            categoryId: req.body.categoryId,

            subCategoryName: req.body.subCategoryName,

            subCategoryDescription: req.body.subCategoryDescription

        });

        req.flash("success", "Sub Category Updated Successfully");

        return res.redirect("/subCategory/view-subCategory");

    } catch (err) {

        console.log(err);

        req.flash("error", "Something Went Wrong");

        return res.redirect("back");

    }
};


module.exports.deleteSubCategory = async (req, res) => {

    try {

        const id = req.params.id;


        await SubCategory.findByIdAndDelete(id);


        req.flash(
            "success",
            "Sub Category Deleted Successfully"
        );


        return res.redirect("/subCategory/view-subCategory");


    } catch (err) {

        console.log(err);

        req.flash(
            "error",
            "Something Went Wrong"
        );

        return res.redirect("back");

    }
};
