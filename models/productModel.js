const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const imagePath = '/assets/images/product';
const { timeStamp } = require('console');
const { type } = require('os');

const productSchema = mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    },

    extraCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExtraCategory',
        required: true
    },

    productName: {
        type: String,
        required : true
    },
    productBrand: {
        type: String,
        required : true
    },
    price: {
        type: Number,
        required : true
    },
    discountPrice: {
        type: Number,
        default : 0
    },
    quantity: {
        type: Number,
    },
    shortDescription: {
        type: String,
        default : ''
    },
    description : {
        type : String,
        default : ''
    },
    productImage: {
        type: String,
    },
    status: {
        type: Boolean,
        default : true
    },
    isDeleted : {
        type : Boolean,
        default : false
    }

}, {
    timestamps: true
});

const productImageStorage = multer.diskStorage({
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

productSchema.statics.uploadImage = multer({
    storage: productImageStorage
}).single('productImage');

productSchema.statics.imagePath = imagePath;

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
