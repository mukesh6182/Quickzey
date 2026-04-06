const express = require('express');
const router = express.Router();
const {
  addStore,
  getLastStoreCode,
  getAllStores,
  getStore,
  updateStore,
  deleteStore,
  setMaintenance,
  getOrdersByStore,
  updateOrderStatus,
  getTopNearbyDeliveryPartners,
  assignDeliveryPartner
} = require('../controllers/StoreController');

const {getAvailableManagers} = require('../controllers/UserController');
const authMiddleware = require('../utils/authMiddleware');
const authorizeRole = require('../utils/authorizeRole');


router.post("/add-store", authMiddleware, authorizeRole("ADMIN"), addStore);

router.get("/last-store-code", authMiddleware, authorizeRole("ADMIN"), getLastStoreCode);

router.get("/get-stores", authMiddleware, authorizeRole("ADMIN"), getAllStores);
router.get("/get-managers", authMiddleware, authorizeRole("ADMIN"), getAvailableManagers);

router.get("/get-store/:id", authMiddleware, authorizeRole("ADMIN"), getStore);

router.put("/update-store/:id", authMiddleware, authorizeRole("ADMIN"), updateStore);

router.delete("/delete-store/:id", authMiddleware, authorizeRole("ADMIN"), deleteStore);

router.post("/maintenance-store/:id", authMiddleware, authorizeRole("ADMIN"), setMaintenance);

router.get("/orders", authMiddleware, authorizeRole("STORE_MANAGER"), getOrdersByStore);
router.patch("/order-status/:orderId",authMiddleware,authorizeRole("STORE_MANAGER"),updateOrderStatus);
router.get("/nearby-delivery-partners", authMiddleware, authorizeRole("STORE_MANAGER"), 
getTopNearbyDeliveryPartners);
router.post("/assign-partner", authMiddleware, authorizeRole("STORE_MANAGER"), assignDeliveryPartner);
module.exports = router;
