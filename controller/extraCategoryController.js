const Category = require('../models/category');
const SubCategory = require('../models/subCategoryModel');
const ExtraCategory = require('../models/extraCategory');

const path = require('path');
const fs = require('fs');

module.exports.addExtraCategoryPage = async (req, res) => {
    try {

        const categoryData = await Category.find({
            status: true,
            isDeleted: false
        });

        const subCategoryData = await SubCategory.find({
            status: true,
            isDeleted: false
        });

        console.log(categoryData);
        console.log(subCategoryData);

        return res.render("add-extraCategory", {
            categoryData,
            subCategoryData
        });

    } catch (err) {
        console.log(err);
    }
};

module.exports.insertExtraCategory = async (req, res) => {
    try {

        await ExtraCategory.create(req.body);

        req.flash("success", "Extra Category Added Successfully");

        return res.redirect("/extraCategory/view-extraCategory");

    } catch (err) {

        console.log(err);

        req.flash("error", "Something Went Wrong");

        return res.redirect('/extraCategory/add-extraCategory');

    }
};

module.exports.changeStatus = async (req, res) => {
    try {

        const id = req.params.id;

        const singleData = await ExtraCategory.findById(id);

        await ExtraCategory.findByIdAndUpdate(id, {
            status: !singleData.status
        });

        req.flash("success", "Status Updated");

        return res.redirect("/extraCategory/view-extraCategory");

    } catch (err) {
        console.log(err);
    }

};



module.exports.viewExtraCategory = async (req, res) => {

    try {

        const currentPage = parseInt(req.query.page) || 1;
        const limit = 10;

        const skip = (currentPage - 1) * limit;


        const extraCategoryData = await ExtraCategory.find({
            isDeleted: false
        })
        .populate('categoryId')
        .populate('subCategoryId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);


        res.render('view-extraCategory', {
            extraCategoryData,
            currentPage,
            limit
        });


    } catch (error) {

        console.log(error);

        res.redirect('back');

    }

};

module.exports.editExtraCategoryPage = async (req,res)=>{

    try{

        const id = req.params.id;

        const extraCategoryData = await ExtraCategory.findById(id);


        const categoryData = await Category.find({
            status:true,
            isDeleted:false
        });


        const subCategoryData = await SubCategory.find({
            status:true,
            isDeleted:false
        });


        res.render('edit-extraCategory',{
            extraCategoryData,
            categoryData,
            subCategoryData
        });


    }catch(error){

        console.log(error);
        res.redirect('back');

    }

};
module.exports.updateExtraCategory = async (req, res) => {

    try {

        const id = req.params.id;


        await ExtraCategory.findByIdAndUpdate(id, {

            categoryId: req.body.categoryId,

            subCategoryId: req.body.subCategoryId,

            extraCategoryName: req.body.extraCategoryName,

            extraCategoryDescription: req.body.extraCategoryDescription

        });


        req.flash(
            "success",
            "Extra Category Updated Successfully"
        );


        res.redirect('/extraCategory/view-extraCategory');


    } catch(error) {

        console.log(error);

        req.flash(
            "error",
            "Something Went Wrong"
        );

        res.redirect('back');

    }

};

module.exports.deleteExtraCategory = async (req,res)=>{

    try{

        const id = req.params.id;


        await ExtraCategory.findByIdAndDelete(id);


        req.flash(
            "success",
            "Extra Category Deleted Successfully"
        );


        res.redirect('/extraCategory/view-extraCategory');


    }catch(error){

        console.log(error);

        req.flash(
            "error",
            "Something Went Wrong"
        );

        res.redirect('back');

    }

};