const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct
} = require('../controllers/productController');
const { protect, ownerOnly } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, ownerOnly, createProduct);
router.put('/:id', protect, ownerOnly, updateProduct);
router.delete('/:id', protect, ownerOnly, deleteProduct);

module.exports = router;
