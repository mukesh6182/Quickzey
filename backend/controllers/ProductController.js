const Product = require('../models/Product');
const createMulterUpload = require('../utils/upload');
const path = require('path');

// Multer for product images (max 5 images)
const uploadProductImages = createMulterUpload('products');

// ---------------- ADD PRODUCT ----------------
const addProduct = async (req, res) => {
  try {
    const { name, category, subCategory, price, description } = req.body;

    if (!name || !category || !subCategory || !price) {
      return res.status(400).json({ message: 'All fields are required except description' });
    }

    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ message: 'At least 2 product images are required' });
    }

    const existing = await Product.findOne({ name });
    if (existing) return res.status(409).json({ message: 'Product already exists' });

    const imagePaths = req.files.map(file => path.join('uploads/products', file.filename));

    const product = new Product({
      name,
      category,
      subCategory,
      price,
      description: description || '',
      images: imagePaths
    });

    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Add Product Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------- GET ALL PRODUCTS ----------------
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: products.length, products });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------- UPDATE PRODUCT ----------------
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, category, subCategory, price, description, status } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (name) product.name = name;
    if (category) product.category = category;
    if (subCategory) product.subCategory = subCategory;
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    if (status) product.status = status;

    if (req.files && req.files.length > 0) {
      if (req.files.length < 2) {
        return res.status(400).json({ message: 'At least 2 product images are required' });
      }
      product.images = req.files.map(file => path.join('uploads/products', file.filename));
    }

    await product.save();
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------- DELETE PRODUCT ----------------
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = 'INACTIVE';
    await product.save();

    res.status(200).json({
      message: 'Product inactivated successfully',
      product
    });
  } catch (error) {
    console.error('Inactive Product Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  uploadProductImages
};
