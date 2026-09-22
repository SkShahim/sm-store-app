const express = require('express');
const router = express.Router();
const {
  placeOrder, verifyPayment, getMyOrders, getAllOrders, updateOrderStatus
} = require('../controllers/orderController');
const { protect, ownerOnly } = require('../middleware/auth');
const checkPincode = require('../middleware/pincodeCheck');

router.post('/', protect, checkPincode, placeOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my', protect, getMyOrders);
router.get('/', protect, ownerOnly, getAllOrders);
router.put('/:id/status', protect, ownerOnly, updateOrderStatus);

module.exports = router;
