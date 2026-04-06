  const express = require('express');
  const router = express.Router();
  const authMiddleware = require('../utils/authMiddleware');
  const authorizeRole = require('../utils/authorizeRole');

  // ----- User Controller -----
  const {addManager,getAllUsers,updateUser,deleteUser,getUserById,addDeliveryPartner } = require('../controllers/UserController');

  // ----- Category Controller -----
  const {addCategory,viewCategories,updateCategory,inactiveCategory,uploadCategoryImage,getCategory, getCategoriesAndSubcategories} = require('../controllers/CategoryController');

  // ----- SubCategory Controller -----
  const {addSubCategory,viewSubCategories,updateSubCategory,inactiveSubCategory,uploadSubCategoryImage} = require('../controllers/SubCategoryController');

  const { addProduct, getProducts, updateProduct, deleteProduct, uploadProductImages } = require('../controllers/ProductController');


  // ----------------- USER ROUTES -----------------
  router.get('/user/:userId', authMiddleware, authorizeRole('ADMIN'), getUserById);
  router.post('/add-manager', authMiddleware, authorizeRole('ADMIN'), addManager);
  router.post('/add-delivery-partner', authMiddleware, authorizeRole('ADMIN'), addDeliveryPartner);

  router.get('/all-users', authMiddleware, authorizeRole('ADMIN'), getAllUsers);
  router.put('/update-user/:userId', authMiddleware, authorizeRole('ADMIN'), updateUser);
  router.delete('/delete-user/:userId', authMiddleware, authorizeRole('ADMIN'), deleteUser);

  // ----------------- CATEGORY ROUTES -----------------
  router.post('/category/add-category',authMiddleware,authorizeRole('ADMIN'),uploadCategoryImage.single('image'),addCategory);
  router.get('/category/all', authMiddleware, authorizeRole('ADMIN'), viewCategories);
  router.put('/category/update/:categoryId',authMiddleware,authorizeRole('ADMIN'), uploadCategoryImage.single('image'),updateCategory);
  router.patch('/category/inactive/:categoryId', authMiddleware, authorizeRole('ADMIN'), inactiveCategory);
  router.get('/category/:categoryId', authMiddleware, authorizeRole('ADMIN'), getCategory);
  router.get('/categories-and-subcategories', getCategoriesAndSubcategories);

  // ----------------- SUBCATEGORY ROUTES -----------------
  router.post('/subcategory/add-subcategory',authMiddleware,authorizeRole('ADMIN'),uploadSubCategoryImage.single('image'),addSubCategory);
  router.get('/subcategory/all', authMiddleware, authorizeRole('ADMIN'), viewSubCategories);
  router.put('/subcategory/update/:subCategoryId',authMiddleware,authorizeRole('ADMIN'),uploadSubCategoryImage.single('image'),updateSubCategory);
  router.patch('/subcategory/inactive/:subCategoryId', authMiddleware, authorizeRole('ADMIN'), inactiveSubCategory);

  // ----------------- Product ROUTES -----------------
  router.post('/product/add',authMiddleware,authorizeRole('ADMIN'),uploadProductImages.array('images', 5),addProduct);

  router.get('/product/all',authMiddleware,authorizeRole('ADMIN'),getProducts);

  router.put('/product/update/:productId',authMiddleware,authorizeRole('ADMIN'), uploadProductImages.array('images', 5),updateProduct);

  router.delete('/product/delete/:productId',authMiddleware,authorizeRole('ADMIN'), deleteProduct);

  module.exports = router;
