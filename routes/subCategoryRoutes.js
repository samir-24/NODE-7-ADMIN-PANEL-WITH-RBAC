const express = require('express');

const route = express.Router();

const subCategoryController = require('../controller/subCategoryController');

const subCategory = require('../models/subCategoryModel');

const passport = require('passport');

const auth = require('../config/auth');

const role = require('../config/roleMiddleware');


// Add SubCategory
route.get('/add-subCategory',auth.checkAuth,role.checkRole('Super Admin', 'Admin'),subCategoryController.addSubCategoryPage);

// Insert SubCategory
route.post('/insert-subCategory',auth.checkAuth,role.checkRole('Super Admin', 'Admin'),subCategoryController.insertSubCategory);

// View SubCategory
route.get('/view-subCategory',auth.checkAuth,role.checkRole('Super Admin', 'Admin', 'Manager', 'Employee'),subCategoryController.viewSubCategoryPage);

// Edit SubCategory
route.get('/edit-subCategory/:id',auth.checkAuth,role.checkRole('Super Admin', 'Admin'),subCategoryController.editSubCategoryPage);

// Update SubCategory
route.post('/update-subCategory/:id',auth.checkAuth,role.checkRole('Super Admin', 'Admin', 'Manager'),subCategoryController.updateSubCategory);

// Change Status
route.get('/changeStatus/:id', auth.checkAuth,role.checkRole('Super Admin', 'Admin', 'Manager'),subCategoryController.changeStatus);

// Delete SubCategory
route.get('/delete-subCategory/:id',auth.checkAuth,role.checkRole('Super Admin', 'Admin'),subCategoryController.deleteSubCategory);

module.exports = route;