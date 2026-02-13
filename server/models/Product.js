const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  brand: { type: String, default: '' },
  outletPrice: { type: Number },
  originalPrice: { type: Number },
  href: { type: String },
  imageUrl: { type: String },
  bGrade: { type: Boolean, default: false },
  bulletPoints: [String],
  category: { type: String, default: '' },
  storeStock: { type: mongoose.Schema.Types.Mixed },
  buyableOnline: { type: Boolean, default: false },
  firstSeenAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

productSchema.index({ name: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
