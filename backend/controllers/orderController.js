const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

const razorpay = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

// Helper: recompute item prices from DB (never trust client-sent prices)
async function buildVerifiedItems(items) {
  let itemsTotal = 0;
  const verified = [];
  for (const it of items) {
    const product = await Product.findById(it.product);
    if (!product) throw new Error(`Product not found: ${it.product}`);
    const variant = product.variants.id(it.variantId);
    if (!variant) throw new Error(`Variant not found for ${product.name}`);
    const lineTotal = variant.price * it.count;
    itemsTotal += lineTotal;
    verified.push({
      product: product._id,
      name: product.name,
      variantLabel: `${variant.quantity} ${variant.unit}`,
      price: variant.price,
      count: it.count
    });
  }
  return { verified, itemsTotal };
}

// POST /api/orders  (pincode already validated by middleware)
exports.placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;
    const { verified, itemsTotal } = await buildVerifiedItems(items);

    const MIN_ORDER_VALUE = Number(process.env.MIN_ORDER_VALUE || 1000);
    if (itemsTotal < MIN_ORDER_VALUE) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value is ₹${MIN_ORDER_VALUE}. Add ₹${MIN_ORDER_VALUE - itemsTotal} more to place this order.`
      });
    }

    const deliveryFee = itemsTotal >= 199 ? 0 : 20;
    const grandTotal = itemsTotal + deliveryFee;

    const order = await Order.create({
      user: req.user._id,
      items: verified,
      deliveryAddress,
      itemsTotal,
      deliveryFee,
      grandTotal,
      paymentMethod,
      paymentStatus: 'pending'
    });

    let razorpayOrder = null;
    if (paymentMethod === 'UPI' && razorpay) {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        receipt: order._id.toString()
      });
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();
    }

    res.status(201).json({ success: true, order, razorpayOrder });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/orders/verify-payment
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'paid', razorpayPaymentId: razorpay_payment_id, status: 'confirmed' },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
};

// GET /api/orders  (owner only)
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user', 'name phone').sort({ createdAt: -1 });
  res.json({ success: true, orders });
};

// PUT /api/orders/:id/status  (owner only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
