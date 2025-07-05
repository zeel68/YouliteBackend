import mongoose from 'mongoose';
const { Schema } = mongoose;
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// Role Schema


// User Schema
const userSchema = new Schema({
    store_id: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Store reference is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'User name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'],
        index: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: 'Please provide a valid email address'
        }
    },
    phone_number: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: [true, 'Phone number already exists'],
        index: true,
        trim: true,
        minlength: [10, 'Phone number must be at least 10 characters'],
    },
    password: {
        type: String,
        required: [true, 'Password hash is required'],
        select: false // Never return this in queries by default
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    phone_verified: {
        type: Boolean,
        default: false
    },
    last_login: {
        type: Date,
        default: null
    },
    role_id: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        default: "6861734f5f118d3ee1451327",
        required: [true, 'Role reference is required']
    },
    profile_url: {
        type: String,
        trim: true,
        validate: {
            validator: (value) => {
                if (!value) return true; // Optional field
                return validator.isURL(value, {
                    protocols: ['http', 'https'],
                    require_protocol: true
                });
            },
            message: 'Profile URL must be a valid HTTP/HTTPS URL'
        }
    },
    address: {
        type: String,
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    is_active: {
        type: Boolean,
        default: true
    },
    access_token: {
        type: String,
        select: false
    },
    refresh_token: {
        type: String,
        select: false
    },
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password_hash;
            delete ret.access_token;
            delete ret.refresh_token;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password_hash;
            delete ret.access_token;
            delete ret.refresh_token;
            return ret;
        }
    }
});

// Virtual for user's role name
userSchema.virtual('role_name', {
    ref: 'Role',
    localField: 'role_id',
    foreignField: '_id',
    justOne: true,
    options: { select: 'name' }
});

// Virtual for store details
userSchema.virtual('store_details', {
    ref: 'Store',
    localField: 'store_id',
    foreignField: '_id',
    justOne: true
});

// Indexes
userSchema.index({ store_id: 1 });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone_number: 1 }, { unique: true });

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})
// Middleware to validate role_id exists
userSchema.pre('save', async function (next) {
    if (this.isModified('role_id')) {
        const roleExists = await mongoose.model('Role').exists({ _id: this.role_id });
        if (!roleExists) {
            throw new Error('Specified role does not exist');
        }
    }
    next();
});

// Middleware to validate store_id exists
userSchema.pre('save', async function (next) {
    if (this.isModified('store_id')) {
        const storeExists = await mongoose.model('Store').exists({ _id: this.store_id });
        if (!storeExists) {
            throw new Error('Specified store does not exist');
        }
    }
    next();
});

// Static method for user registration validation
userSchema.statics.validateRegistration = function (userData) {
    return new Promise((resolve, reject) => {
        const user = new this(userData);
        user.validate((err) => {
            if (err) {
                const errors = {};
                Object.keys(err.errors).forEach((key) => {
                    errors[key] = err.errors[key].message;
                });
                reject({ errors, message: 'User validation failed' });
            } else {
                resolve(user);
            }
        });
    });
};

userSchema.methods.isPasswordCorrect = async function (password) {
    console.log(password, this.password);

    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)


