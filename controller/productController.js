const Admin = require('../models/adminModel');
const Category = require('../models/category');
const SubCategory = require('../models/subCategoryModel');
const ExtraCategory = require('../models/extraCategory');
const Product = require('../models/productModel');
const path = require('path');
const fs = require('fs');

const deleteProductImage = (productImage) => {

    if (!productImage) {
        return;
    }

    const imagePath = path.join(
        __dirname,
        "..",
        "public",
        productImage.replace(/^\//, "")
    );

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Product Image Deleted Successfully");
    }

}

module.exports.addProductPage = async (req, res) => {
    try {

        const categoryData = await Category.find({
            status: true,
            isDeleted: false
        });

        const subCategoryData = await SubCategory.find({
            status: true,
            isDeleted: false
        });

        const extraCategoryData = await ExtraCategory.find({
            status: true,
            isDeleted: false
        });

        console.log(categoryData);
        console.log(subCategoryData);
        console.log(extraCategoryData);

        return res.render("add-product", {
            categoryData,
            subCategoryData,
            extraCategoryData
        });

    } catch (err) {
        console.log(err);
    }
};

module.exports.insertProduct = async (req, res) => {
    try {

        if (req.file) {
            req.body.productImage = Product.imagePath + "/" + req.file.filename;
        }

        req.body.status = req.body.status === "true";

        await Product.create({
            categoryId: req.body.categoryId,
            subCategoryId: req.body.subCategoryId,
            extraCategoryId: req.body.extraCategoryId,
            productName: req.body.productName,
            productBrand: req.body.productBrand,
            price: req.body.price,
            discountPrice: req.body.discountPrice || 0,
            quantity: req.body.quantity,
            shortDescription: req.body.shortDescription,
            description: req.body.description,
            productImage: req.body.productImage,
            status: req.body.status
        });

        console.log("PRODUCT ADDED SUCCESSFULLY...!");

        req.flash("success", "Product Added Successfully!");

        return res.redirect("/product/add-product");

    } catch (err) {

        console.log(err);

        req.flash("error", "Failed to Add Product!");

        return res.redirect("back");
    }
};

module.exports.viewProductPage = async (req, res) => {
    try {

        const productData = await Product.find({
            isDeleted: false
        })
        .populate("categoryId")
        .populate("subCategoryId")
        .populate("extraCategoryId")
        .sort({ createdAt: -1 });

        return res.render("view-product", {
            productData
        });

    } catch (err) {
        console.log(err);
        req.flash("error", "Unable to fetch products");
        return res.redirect("back");
    }
};

module.exports.changeStatus = async (req, res) => {

    try {

        const id = req.params.id;

        const singleProduct = await Product.findById(id);

        await Product.findByIdAndUpdate(id, {
            status: !singleProduct.status
        });

        req.flash("success", "Product Status Updated Successfully");

        return res.redirect("/product/view-product");

    } catch (err) {

        console.log(err);

        req.flash("error", "Something Went Wrong");

        return res.redirect("back");

    }

};

module.exports.editProductPage = async (req, res) => {

    try {

        const id = req.params.id;

        const productData = await Product.findById(id);

        const categoryData = await Category.find({
            status: true,
            isDeleted: false
        });

        const subCategoryData = await SubCategory.find({
            status: true,
            isDeleted: false
        });

        const extraCategoryData = await ExtraCategory.find({
            status: true,
            isDeleted: false
        });

        return res.render("edit-product", {

            productData,
            categoryData,
            subCategoryData,
            extraCategoryData

        });

    }

    catch (err) {

        console.log(err);

        return res.redirect("back");

    }

}

module.exports.updateProduct = async (req, res) => {

    try {

        const id = req.params.id;

        const oldProduct = await Product.findById(id);

        if (!oldProduct) {

            req.flash("error", "Product Not Found");

            return res.redirect("/product/view-product");

        }

        let productImage = oldProduct.productImage;

        if (req.file) {

            deleteProductImage(oldProduct.productImage);

            productImage = Product.imagePath + "/" + req.file.filename;

        }

        await Product.findByIdAndUpdate(id, {

            categoryId: req.body.categoryId,

            subCategoryId: req.body.subCategoryId,

            extraCategoryId: req.body.extraCategoryId,

            productName: req.body.productName,

            productBrand: req.body.productBrand,

            price: req.body.price,

            discountPrice: req.body.discountPrice,

            quantity: req.body.quantity,

            shortDescription: req.body.shortDescription,

            description: req.body.description,

            productImage: productImage

        });

        req.flash(
            "success",
            "Product Updated Successfully"
        );

        return res.redirect("/product/view-product");

    }

    catch (err) {

        console.log(err);

        req.flash(
            "error",
            "Something Went Wrong"
        );

        return res.redirect("back");

    }

}

module.exports.deleteProduct = async (req, res) => {
    try {

        const id = req.params.id;

        const product = await Product.findById(id);

        if (!product) {
            req.flash("error", "Product Not Found");
            return res.redirect("/product/view-product");
        }

        deleteProductImage(product.productImage);

        await Product.findByIdAndDelete(id);

        req.flash("success", "Product Deleted Successfully");

        return res.redirect("/product/view-product");

    } catch (err) {

        console.log(err);

        req.flash("error", "Something Went Wrong");

        return res.redirect("back");
    }
};