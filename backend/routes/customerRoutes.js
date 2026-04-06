const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/authMiddleware');
const authorizeRole = require('../utils/authorizeRole');
const {getMyProfile,updateMyProfile}=require('../controllers/UserController');
const {
  getCategoriesByPincode,getProductsByPin,getProductDetails
} = require('../controllers/StoreProductController');
const { placeOrder, getMyOrders } = require('../controllers/OrderController');



router.get('/categories-by-pincode', getCategoriesByPincode);

router.get('/get-prdocuts', getProductsByPin);

router.get('/store-product/:id', getProductDetails);

router.get('/me', authMiddleware,authorizeRole('CUSTOMER'), getMyProfile);
router.put('/update-me',  authMiddleware,authorizeRole('CUSTOMER'), updateMyProfile);

router.post('/place-order', authMiddleware, authorizeRole('CUSTOMER'), placeOrder);

  router.get('/my-orders', authMiddleware, authorizeRole('CUSTOMER'), getMyOrders);
module.exports = router;
