const mongoose = require('mongoose');

const scrapeLogSchema = new mongoose.Schema({
  startedAt: { type: Date, required: true },
  finishedAt: { type: Date, required: true },
  status: { type: String, enum: ['success', 'failed'], required: true },
  totalProducts: { type: Number, default: 0 },
  newProducts: { type: Number, default: 0 },
  removedProducts: { type: Number, default: 0 },
  error: { type: String, default: null },
});

scrapeLogSchema.index({ startedAt: -1 });

module.exports = mongoose.model('ScrapeLog', scrapeLogSchema);
