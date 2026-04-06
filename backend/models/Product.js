  const mongoose = require('mongoose');
  const slugify = require('slugify');

  const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Product name is required'],
      minlength: [3, 'Product name must be at least 3 characters'],
      trim: true
    },
    slug: {
      type: String,
      unique: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    images: {
      type: [String],
      validate: {
        validator: function(v) {
          return v.length >= 2 && v.length <= 5;
        },
        message: 'A product must have between 2 and 5 images'
      },
      required: [true, 'Product images are required']
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    }
  }, { timestamps: true });

  // Generate slug before saving
  productSchema.pre('save', function() {
    if (this.isModified('name')) {
      this.slug = slugify(this.name, { lower: true });
    }
  });


  module.exports = mongoose.model('Product', productSchema);
