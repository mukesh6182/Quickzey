const mongoose = require('mongoose');
const StoreProduct = require('../models/StoreProduct');
const Store = require('../models/Store');
const Product = require('../models/Product');


const addProductToStore = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { productId, stock, status } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'ProductId is required' });
    }

    const parsedStock = Number(stock);
    if (parsedStock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    // 1️⃣ Find store for this manager
    const store = await Store.findOne({ manager: managerId });
    if (!store) {
      return res.status(404).json({ message: 'No store found for this manager' });
    }

    // 2️⃣ Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 3️⃣ Prevent duplicate product in same store
    const exists = await StoreProduct.findOne({
      store: store._id,
      product: productId
    });

    if (exists) {
      return res.status(400).json({ message: 'Product already added to store' });
    }

    const storeProduct = new StoreProduct({
      store: store._id,
      product: productId,
      stock: parsedStock || 0,
      status: status || 'AVAILABLE'
    });

    await storeProduct.save();

    res.status(201).json({
      message: 'Product added to store successfully',
      storeProduct
    });
  } catch (error) {
    console.error('Add Product To Store Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStoreProduct = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { storeProductId } = req.params;
    const { stock, status } = req.body;

    const store = await Store.findOne({ manager: managerId });
    if (!store) {
      return res.status(404).json({ message: 'No store found for this manager' });
    }

    const storeProduct = await StoreProduct.findOne({
      _id: storeProductId,
      store: store._id
    });

    if (!storeProduct) {
      return res.status(404).json({ message: 'Store product not found' });
    }

    if (stock !== undefined) {
      if (stock < 0) {
        return res.status(400).json({ message: 'Stock cannot be negative' });
      }
      storeProduct.stock = stock;
    }

    if (status) {
      storeProduct.status = status;
    }

    await storeProduct.save();

    res.status(200).json({
      message: 'Store product updated successfully',
      storeProduct
    });
  } catch (error) {
    console.error('Update Store Product Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const removeProductFromStore = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { storeProductId } = req.params;

    const store = await Store.findOne({ manager: managerId });
    if (!store) {
      return res.status(404).json({ message: 'No store found for this manager' });
    }

    const storeProduct = await StoreProduct.findOneAndDelete({
      _id: storeProductId,
      store: store._id
    });

    if (!storeProduct) {
      return res.status(404).json({ message: 'Store product not found' });
    }

    res.status(200).json({
      message: 'Product removed from store successfully'
    });
  } catch (error) {
    console.error('Remove Store Product Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getStoreProducts = async (req, res) => {
  try {
    const managerId = req.user.id;

    const store = await Store.findOne({ manager: managerId });
    if (!store) {
      return res.status(404).json({ message: 'No store assigned to this manager' });
    }

    const products = await StoreProduct.find({ store: store._id })
      .populate({
        path: 'product',
        select: 'name slug price images status category subCategory',
        populate: [
          { path: 'category', select: 'name slug status' },
          { path: 'subCategory', select: 'name slug status' }
        ]
      });

    res.status(200).json({
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get Store Products Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getProductsByPincode = async (req, res) => {
  try {
    const { pincode } = req.query;
    if (!pincode) {
      return res.status(400).json({ message: 'Pincode is required' });
    }

    const stores = await Store.find({
      servedPincodes: pincode,
      status: 'ACTIVE'
    });

    if (!stores.length) {
      return res.status(404).json({ message: 'No stores found for this pincode' });
    }

    const storeIds = stores.map(s => s._id);

    const products = await StoreProduct.find({
      store: { $in: storeIds },
      status: 'AVAILABLE',
      stock: { $gt: 0 }
    }).populate({
      path: 'product',
      select: 'name slug price images status category subCategory',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'subCategory', select: 'name' }
      ]
    });

    res.status(200).json({
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get Products By Pincode Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getProductsByCategoryAndSubcategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a category first',
        products: []
      });
    }

    const query = {
      category: new mongoose.Types.ObjectId(categoryId),
      status: 'ACTIVE'
    };

    if (subCategoryId) {
      query.subCategory = new mongoose.Types.ObjectId(subCategoryId);
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .select('name slug category subCategory price images status');

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Get Products By Category/Subcategory Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getCategoriesByPincode = async (req, res) => {
  try {
    const { pincode } = req.query;

    if (!pincode) {
      return res.status(400).json({ message: 'Pincode is required' });
    }

    // 1️⃣ Find active store serving this pincode
    const store = await Store.findOne({
      servedPincodes: pincode,
      status: 'ACTIVE'
    });

    if (!store) {
      return res.status(404).json({
        message: 'Service not available for this pincode'
      });
    }

    // 2️⃣ Get store products with product + category
    const storeProducts = await StoreProduct.find({
      store: store._id,
      status: 'AVAILABLE',
      stock: { $gt: 0 }
    }).populate({
      path: 'product',
      select: 'category',
      populate: {
        path: 'category',
        select: 'name slug image order status'
      }
    });

    // 3️⃣ Extract unique categories
    const categoryMap = new Map();

    storeProducts.forEach(sp => {
      if (sp.product && sp.product.category) {
        categoryMap.set(
          sp.product.category._id.toString(),
          sp.product.category
        );
      }
    });

    res.status(200).json({
      storeId: store._id,
      categories: Array.from(categoryMap.values())
    });

  } catch (error) {
    console.error('Get Categories By Pincode Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductsByPin = async (req, res) => {
  try {
    const { pincode, categoryId, subCategoryId } = req.query; // Added category/subcategory
    if (!pincode) {
      return res.status(400).json({ message: 'Pincode is required' });
    }

    const stores = await Store.find({ servedPincodes: pincode, status: 'ACTIVE' });
    if (!stores.length) {
      return res.status(404).json({ message: 'No stores found' });
    }

    const storeIds = stores.map(s => s._id);

    // Build filter query
    let productFilter = {
      store: { $in: storeIds },
      status: 'AVAILABLE',
      stock: { $gt: 0 }
    };

    // If categoryId is passed, we need to filter the populated product
    // However, Mongoose populate filter doesn't remove the StoreProduct. 
    // So we use a more robust approach:
    const storeProducts = await StoreProduct.find(productFilter).populate({
      path: 'product',
      match: categoryId ? { category: categoryId } : {}, // Filter by category
      populate: [
        { path: 'category', select: 'name' },
        { path: 'subCategory', select: 'name' }
      ]
    });

    // Filter out results where the 'product' didn't match the categoryId
    let filteredResults = storeProducts.filter(sp => sp.product !== null);

    // If subCategoryId is provided, filter further
    if (subCategoryId) {
      filteredResults = filteredResults.filter(sp => 
        sp.product.subCategory && sp.product.subCategory._id.toString() === subCategoryId
      );
    }

    res.status(200).json({
      count: filteredResults.length,
      products: filteredResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const storeProduct = await StoreProduct.findById(id)
      .populate({
        path: 'product',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'subCategory', select: 'name' }
        ]
      })
      .populate('store', 'name address phone'); // Optional: show store info

    if (!storeProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(storeProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = {
  addProductToStore,
  updateStoreProduct,
  removeProductFromStore,
  getStoreProducts,
  getProductsByPincode,
  getProductsByCategoryAndSubcategory,
  getCategoriesByPincode,
  getProductsByPin,
  getProductDetails
};
