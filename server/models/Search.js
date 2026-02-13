const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  query: { type: String, required: true },
  minDiscount: { type: Number, default: 0 },
  buyableOnline: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Search', searchSchema);
