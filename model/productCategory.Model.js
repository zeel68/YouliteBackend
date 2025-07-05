import mongoose from "mongoose";
const Schema = mongoose.Schema;


// Store Category Schema
const productCategorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
    },
    store_id: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },
    image_url: {
        type: String,
        default: ''
    },
    store_id: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
})

export const StoreCategory = mongoose.model('ProductCategory', productCategorySchema);


