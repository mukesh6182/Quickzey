const SubCategory = require('../models/SubCategory');
const createMulterUpload = require('../utils/upload');
const path = require('path');

// Multer middleware for subcategory images
const uploadSubCategoryImage = createMulterUpload('subcategories');

// ----------------- ADD SUBCATEGORY -----------------
const addSubCategory = async (req, res) => {
  try {
    const { name, category, order } = req.body;
    if (!name || !category) return res.status(400).json({ message: 'Name and category are required' });
    if (!req.file) return res.status(400).json({ message: 'Subcategory image is required' });

    const existing = await SubCategory.findOne({ name, category });
    if (existing) return res.status(409).json({ message: 'Subcategory already exists under this category' });

    const subcategory = new SubCategory({
      name,
      category,
      order: order || 0,
      image: `uploads/subcategories/${req.file.filename}`
    });

    await subcategory.save();
    res.status(201).json({ message: 'Subcategory added successfully', subcategory });
  } catch (error) {
    console.error('Add SubCategory Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------- VIEW SUBCATEGORIES -----------------
const viewSubCategories = async (req, res) => {
  try {
    const subcategories = await SubCategory.find().populate('category', 'name').sort({ order: 1 });
    res.status(200).json({ count: subcategories.length, subcategories });
  } catch (error) {
    console.error('View SubCategories Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------- UPDATE SUBCATEGORY -----------------
const updateSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const { name, category, order, status } = req.body;

    const subcategory = await SubCategory.findById(subCategoryId);
    if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });

    if (name) subcategory.name = name;
    if (category) subcategory.category = category;
    if (order !== undefined) subcategory.order = order;
    if (status) subcategory.status = status;
    if (req.file) subcategory.image = `uploads/subcategories/${req.file.filename}`;

    await subcategory.save();
    res.status(200).json({ message: 'Subcategory updated successfully', subcategory });
  } catch (error) {
    console.error('Update SubCategory Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------- INACTIVATE SUBCATEGORY -----------------
const inactiveSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const subcategory = await SubCategory.findById(subCategoryId);
    if (!subcategory) return res.status(404).json({ message: 'Subcategory not found' });

    subcategory.status = 'INACTIVE';
    await subcategory.save();
    res.status(200).json({ message: 'Subcategory inactivated successfully', subcategory });
  } catch (error) {
    console.error('Inactive SubCategory Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addSubCategory,
  viewSubCategories,
  updateSubCategory,
  inactiveSubCategory,
  uploadSubCategoryImage
};
