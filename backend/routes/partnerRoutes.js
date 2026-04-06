const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/authMiddleware');
const authorizeRole = require('../utils/authorizeRole');
const { getPartnerDeliveries ,verifyDeliveryOTP} = require('../controllers/OrderController');
const { toggleDeliveryStatus } = require('../controllers/UserController');


router.patch('/toggle-status', authMiddleware, authorizeRole('DELIVERY'), toggleDeliveryStatus);

router.get('/partner-deliveries',authMiddleware,authorizeRole('DELIVERY'),getPartnerDeliveries);

router.post('/verify-otp',authMiddleware,authorizeRole('DELIVERY'),verifyDeliveryOTP);
module.exports = router;