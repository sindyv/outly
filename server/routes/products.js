const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, page = 1, limit = 24, minDiscount, buyableOnline } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }
    if (buyableOnline === 'true') {
      filter.buyableOnline = true;
    }
    if (minDiscount && Number(minDiscount) > 0) {
      const discountFrac = 1 - Number(minDiscount) / 100;
      filter.$expr = { $lte: [{ $divide: ['$outletPrice', '$originalPrice'] }, discountFrac] };
      filter.originalPrice = { $gt: 0 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(q ? { score: { $meta: 'textScore' } } : { firstSeenAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
