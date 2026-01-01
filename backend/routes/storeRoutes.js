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

const { authMiddleware } = require('../utils/authMiddleware');
const { authorizeRole }=require('../utils/authorizeRole');

router.post("/add-store", authMiddleware, authorizeRole("admin"), addStore);

router.get("/last-store-code", authMiddleware, authorizeRole("admin"), getLastStoreCode);

router.get("/get-stores", authMiddleware, authorizeRole("admin"), getAllStores);

router.get("/get-store/:id", authMiddleware, authorizeRole("admin"), getStore);

router.put("/update-store/:id", authMiddleware, authorizeRole("admin"), updateStore);

router.delete("/delete-store/:id", authMiddleware, authorizeRole("admin"), deleteStore);

router.post("/maintenance-store/:id", authMiddleware, authorizeRole("admin"), setMaintenance);

module.exports = router;
