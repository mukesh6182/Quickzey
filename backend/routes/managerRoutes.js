const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/authMiddleware');
const authorizeRole = require('../utils/authorizeRole');
const {
  addProductToStore,
  updateStoreProduct,
  removeProductFromStore,
  getStoreProducts,
  getProductsByCategoryAndSubcategory
} = require('../controllers/StoreProductController');

const {getCategoriesAndSubcategories}= require('../controllers/CategoryController');
// Only store managers
router.use(authMiddleware);
router.use(authorizeRole('STORE_MANAGER'));

// Add product to store (manager can only add to their store)
router.post('/store-product/add', addProductToStore);
router.get('/store-product/products', getProductsByCategoryAndSubcategory);
// Update stock/price/status
router.put('/store-product/update/:storeProductId', updateStoreProduct);

// Remove product from store
router.delete('/store-product/remove/:storeProductId', removeProductFromStore);

// Get all products of manager's store
router.get('/store-product/all', getStoreProducts);
router.get('/categories-and-subcategories', getCategoriesAndSubcategories);

module.exports = router;
