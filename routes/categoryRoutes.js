const express = require('express');

const route = express.Router();

const categoryController = require('../controller/categoryController');

const Category = require('../models/category');

const passport = require('passport');

const role = require('../config/roleMiddleware')

const auth = require('../config/auth');

route.get('/add-category',auth.checkAuth,role.checkRole('Super Admin' , 'Admin' ),categoryController.addCategoryPage);

route.post('/insert-category', auth.checkAuth, Category.uploadImage, categoryController.insertCategory);

route.get('/view-category' ,role.checkRole('Super Admin' , 'Admin' , 'Manager' , 'Employee') ,categoryController.viewCategoryPage);

route.get('/edit-category/:id',role.checkRole('Super Admin' , 'Admin'),auth.checkAuth,categoryController.editCategoryPage);

route.post('/update-category/:id',role.checkRole('Super Admin' , 'Admin' , 'Manager'),auth.checkAuth, Category.uploadImage,categoryController.updateCategory);

route.get('/changeStatus/:id',role.checkRole('Super Admin' , 'Admin' , 'Manager'),auth.checkAuth,categoryController.changeStatus);

module.exports = route;
