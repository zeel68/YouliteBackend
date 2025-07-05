import mongoose from "mongoose";
const { Schema } = mongoose;

const tagSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tag name is required'],
        trim: true,
        minlength: [1, 'Tag name must be at least 1 character'],
        maxlength: [50, 'Tag name cannot exceed 50 characters'],
        index: true
    },
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export const Tag = mongoose.model('Tag', tagSchema); 