const mongoose = require('mongoose');

const subCategorySchema = mongoose.Schema({
    categoryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required : true
    },
    subCategoryName: {
        type: String,
        required : true,
        trim : true
    },
    subCategoryDescription : {
        type: String,
        default : ""
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

const SubCategory = mongoose.model('SubCategory', subCategorySchema);
module.exports = SubCategory;
