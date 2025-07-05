import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "product name can't be empty"],
  },
  description: String,
  price: {
    type: Number,
    required: [true, "product price can't be null or zero"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: [true, "product category can't be null"],
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        default: 0
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  attributes: {
    color: {
      type: [
        {
          colorOption: {
            type: String,
          },
          isSelected: {
            type: Boolean,
            default: false
          }
        }
      ]
    },
    size: {
      type: [
        {
          colorOption: {
            type: Number,
          },
          isSelected: {
            type: Boolean,
            default: false
          }
        }
      ]
    },

  },
  stock: {
    quantity: {
      type: Number,
      default: 0,
      required: [true, "Quantity is required"]
    },
    reserved: {
      type: Number,
      default: 0
    }
  },
  images: [String],
  tags: [String],
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  }
});
productSchema.pre('save', async function (next) {
  try {
    // Calculate average rating
    const totalRatings = this.reviews.length;
    const totalRatingSum = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = totalRatings > 0 ? totalRatingSum / totalRatings : 0;

    // Update total ratings count
    this.ratings.count = totalRatings;

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update category's product count
productSchema.post('save', async function (doc, next) {
  try {

    const Category = mongoose.model('Category');
    await Category.findByIdAndUpdate(doc.category, { $inc: { productCount: 1 } });
    next();
  } catch (error) {
    next(error);
  }
});

export const Product = mongoose.model('Product', productSchema);

