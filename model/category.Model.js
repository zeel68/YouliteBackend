import mongoose from 'mongoose';
const { Schema } = mongoose;

const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: [true, 'Category name must be unique'],
        trim: true,
        minlength: [2, 'Category name must be at least 2 characters'],
        maxlength: [100, 'Category name cannot exceed 100 characters'],
        index: true
    },
    image_url: {
        type: String,
    },
    attribute_schema: {
        type: Schema.Types.Mixed,
        default: {}
    },
    // Adding timestamps which are generally useful
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    virtuals: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for stores count
categorySchema.virtual('stores_count', {
    ref: 'Store',
    localField: '_id',
    foreignField: 'category_id',
    count: true
});

// Virtual for tags count
categorySchema.virtual('tags_count', {
    ref: 'Tag',
    localField: '_id',
    foreignField: 'category_id',
    count: true
});

// Virtual for stores (if you need the actual stores)
categorySchema.virtual('stores', {
    ref: 'Store',
    localField: '_id',
    foreignField: 'category_id'
});

// Virtual for tags (if you need the actual tags)
categorySchema.virtual('tags', {
    ref: 'Tag',
    localField: '_id',
    foreignField: 'category_id'
});

// Middleware to update the updated_at timestamp
categorySchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

// Middleware to prevent deletion if referenced by stores
categorySchema.pre('deleteOne', { document: true }, async function (next) {
    const storeCount = await mongoose.model('Store').countDocuments({ category_id: this._id });
    if (storeCount > 0) {
        throw new Error('Cannot delete category referenced by stores');
    }
    next();
});



export const Category = mongoose.model('Category', categorySchema);
