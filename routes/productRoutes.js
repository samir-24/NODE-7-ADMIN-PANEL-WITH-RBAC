const express = require('express');

const route = express.Router();

const auth = require('../config/auth');

const role = require('../config/roleMiddleware');

const productController = require('../controller/productController');

const Product = require('../models/productModel');

const passport = require('passport');

// Add Product
route.get('/add-product',auth.checkAuth,role.checkRole('Super Admin', 'Admin'),productController.addProductPage);

// Insert Product
route.post('/insertProduct',auth.checkAuth,role.checkRole('Super Admin', 'Admin'),Product.uploadImage,productController.insertProduct);

// View Product
route.get('/view-product',auth.checkAuth,role.checkRole('Super Admin', 'Admin', 'Manager', 'Employee'),productController.viewProductPage);

// Change Status
route.get('/change-status/:id',auth.checkAuth,role.checkRole('Super Admin', 'Admin', 'Manager'),productController.changeStatus);

// Edit Product Page
route.get('/edit-product/:id',auth.checkAuth,role.checkRole('Super Admin', 'Admin'),productController.editProductPage);

// Update Product
route.post('/update-product/:id',auth.checkAuth,role.checkRole('Super Admin', 'Admin', 'Manager'),Product.uploadImage,productController.updateProduct);

// Delete Product
route.get('/delete-product/:id',auth.checkAuth,role.checkRole('Super Admin', 'Admin'),productController.deleteProduct);

module.exports = route;