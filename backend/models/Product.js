const mongoose = require('mongoose');

// Each product can have multiple weight/quantity variants, each with its own price.
// e.g. Chal -> [{ quantity: 500, unit: 'gm', price: 20 }, { quantity: 1, unit: 'kg', price: 38 }]
const variantSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },      // e.g. 500, 1, 250
  unit: {
    type: String,
    required: true,
    enum: ['gm', 'kg', 'ml', 'l', 'pcs', 'pack', 'dozen']
  },
  price: { type: Number, required: true, min: 0 }, // ₹ for this variant
  mrp: { type: Number, min: 0 },                    // optional strike-through price
  stock: { type: Number, default: 100 },            // units available for this variant
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },        // e.g. "Chal (Rice)", "Alu (Potato)"
  nameBengali: { type: String, trim: true },                  // optional Bengali name
  category: {
    type: String,
    required: true,
    enum: ['Rice & Grains', 'Vegetables', 'Fruits', 'Dairy & Eggs', 'Oil & Ghee',
           'Spices & Masala', 'Snacks', 'Beverages', 'Personal Care', 'Household', 'Other'],
    default: 'Other'
  },
  description: { type: String, trim: true },
  image: { type: String, default: '' },  // URL or local asset path
  variants: {
    type: [variantSchema],
    validate: v => Array.isArray(v) && v.length > 0
  },
  isAvailable: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
