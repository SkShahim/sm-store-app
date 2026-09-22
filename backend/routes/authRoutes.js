const express = require('express');
const router = express.Router();
const { register, login, addAddress } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const checkPincode = require('../middleware/pincodeCheck');

router.post('/register', register);
router.post('/login', login);
router.post('/address', protect, checkPincode, addAddress);

module.exports = router;
