const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    minlength: [3, 'Category name must be at least 3 characters'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  image: {
    type: String, 
    required: true
  },
   order: {
    type: Number,
    default: 0,
    validate: {
      validator: function(value) {
        return typeof value === 'number' && !isNaN(value);  // Check if value is a number and not NaN
      },
      message: 'Order must be a valid number'  // Custom error message
    }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

categorySchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
});

module.exports = mongoose.model('Category', categorySchema);
