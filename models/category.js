const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const imagePath = '/assets/images/category';
const { timeStamp } = require('console');
const { type } = require('os');

const categorySchema = mongoose.Schema({
    categoryName: {
        type: String,
        required : true
    },
    categoryDescription : {
        type: String,
        default : ""
    },
    categoryImage :{
        type : String,
        default : ''
    },
    status : {
        type : Boolean,
        default : true
    },
    isDeleted : {
        type : Boolean,
        default : false
    }
}, {
    timestamps: true
});

const categoryImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", 'public', imagePath))
    },
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    }
});

categorySchema.statics.uploadImage = multer({
    storage: categoryImageStorage
}).single('categoryImage');

categorySchema.statics.imagePath = imagePath;

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
