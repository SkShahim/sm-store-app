const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },        // snapshot at order time
  variantLabel: { type: String, required: true }, // e.g. "500 gm"
  price: { type: Number, required: true },        // price per unit at order time
  count: { type: Number, required: true, min: 1 } // how many of this variant
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [orderItemSchema], validate: v => v.length > 0 },
  deliveryAddress: {
    fullAddress: { type: String, required: true },
    pincode: {
      type: String,
      required: true,
      validate: {
        validator: v => v === (process.env.ALLOWED_PINCODE || '712310'),
        message: 'Delivery is only available for pincode 712310'
      }
    },
    landmark: String,
    phone: { type: String, required: true }
  },
  itemsTotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'COD'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
