const express = require('express');
const route = express.Router();

const extraCategoryController = require('../controller/extraCategoryController');

const role = require('../config/roleMiddleware')

const auth = require('../config/auth');

route.get('/add-extraCategory',role.checkRole('Super Admin' , 'Admin' ),auth.checkAuth,extraCategoryController.addExtraCategoryPage);

route.post('/insert-extraCategory',auth.checkAuth,extraCategoryController.insertExtraCategory);

route.get("/changeStatus/:id",role.checkRole('Super Admin' , 'Admin' ,'Manager'),auth.checkAuth,extraCategoryController.changeStatus);

route.get('/view-extraCategory',auth.checkAuth,role.checkRole('Super Admin' , 'Admin' , 'Manager' , 'Employee'),extraCategoryController.viewExtraCategory);

route.get('/edit-extraCategory/:id',role.checkRole('Super Admin' , 'Admin' ),auth.checkAuth,extraCategoryController.editExtraCategoryPage);

// update
route.post('/update-extraCategory/:id',role.checkRole('Super Admin' , 'Admin' ),auth.checkAuth,extraCategoryController.updateExtraCategory);

// delete
route.get('/delete-extraCategory/:id',role.checkRole('Super Admin' , 'Admin' ),auth.checkAuth,extraCategoryController.deleteExtraCategory);

module.exports = route;