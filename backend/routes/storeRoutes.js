const express = require('express');
const router = express.Router();
const {
  addStore,
  getLastStoreCode,
  getAllStores,
  getStore,
  updateStore,
  deleteStore,
  setMaintenance
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

module.exports = router;
