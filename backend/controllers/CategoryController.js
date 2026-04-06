const Category = require('../models/Category');
const createMulterUpload = require('../utils/upload');
const path = require('path');
const SubCategory = require('../models/SubCategory');
// Multer middleware for category images
const uploadCategoryImage = createMulterUpload('categories');

// ----------------- ADD CATEGORY -----------------
const addCategory = async (req, res) => {
  try {
    const { name, order } = req.body;

    // Validate that order is a number
    if (isNaN(order)) {
      return res.status(400).json({ message: 'Order must be a number' });
    }

    if (!name) return res.status(400).json({ message: 'Category name is required' });
    if (!req.file) return res.status(400).json({ message: 'Category image is required' });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(409).json({ message: 'Category already exists' });

    const category = new Category({
      name,
      order: order || 0,  // Default to 0 if no order is provided
      image: `uploads/categories/${req.file.filename}`,
    });

    await category.save(); // Saving the category
    res.status(201).json({ message: 'Category added successfully', category });
  } catch (error) {
    console.error('Add Category Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// ----------------- VIEW CATEGORIES -----------------
const viewCategories = async (req, res) => {
  try {    
    const { status } = req.query;
    const query = status ? { status } : {}; 
    
    const categories = await Category.find(query).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('Get All Categories Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----------------- UPDATE CATEGORY -----------------
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, order, status } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (name) category.name = name;
    if (order !== undefined) category.order = order;
    if (status) category.status = status;
    if (req.file) category.image = `uploads/categories/${req.file.filename}`;

    await category.save();
    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Update Category Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------- INACTIVATE CATEGORY -----------------
const inactiveCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.status = 'INACTIVE';
    await category.save();
    res.status(200).json({ message: 'Category inactivated successfully', category });
  } catch (error) {
    console.error('Inactive Category Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const getCategory = async (req, res) => {
  try {
    const { categoryId } = req.params; // Extract categoryId from the request params
    const category = await Category.findById(categoryId); // Find the category by ID

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: category }); // Return the category data
  } catch (error) {
    console.error('Get Category Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const getCategoriesAndSubcategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    const subcategories = await SubCategory.find().sort({ order: 1 }).populate('category', 'name');

    res.status(200).json({
      success: true,
      categories,
      subcategories,
    });
  } catch (error) {
    console.error('Error fetching categories and subcategories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  addCategory,
  viewCategories,
  updateCategory,
  inactiveCategory,
  uploadCategoryImage,
  getCategory,
  getCategoriesAndSubcategories
};
