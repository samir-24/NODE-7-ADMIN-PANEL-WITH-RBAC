const mongoose = require('mongoose');

const extraCategorySchema = mongoose.Schema({
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

    extraCategoryName: {
        type: String,
        required: true,
        trim: true
    },

    extraCategoryDescription: {
        type: String,
        default: ""
    },

    status: {
        type: Boolean,
        default: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

const ExtraCategory = mongoose.model('ExtraCategory', extraCategorySchema);

module.exports = ExtraCategory;