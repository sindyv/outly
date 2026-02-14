const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, page = 1, limit = 24, minDiscount, buyableOnline, sort, minPrice, maxPrice } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const hasText = q && q.trim();
    // Quote each word so MongoDB $text requires ALL terms (AND logic instead of OR)
    const textQuery = hasText
      ? q.trim().split(/\s+/).map((w) => `"${w}"`).join(' ')
      : '';
    const hasMinDiscount = minDiscount && Number(minDiscount) > 0;
    const needsAggregation = hasMinDiscount || sort === 'discount';

    if (needsAggregation) {
      // Use aggregation pipeline when we need computed fields ($expr / discount sort)
      const pipeline = [];

      // $text match must be first stage
      const matchStage = {};
      if (hasText) {
        matchStage.$text = { $search: textQuery };
      }
      if (buyableOnline === 'true') {
        matchStage.buyableOnline = true;
      }
      if (minPrice && Number(minPrice) > 0) {
        matchStage.outletPrice = { ...matchStage.outletPrice, $gte: Number(minPrice) };
      }
      if (maxPrice && Number(maxPrice) > 0) {
        matchStage.outletPrice = { ...matchStage.outletPrice, $lte: Number(maxPrice) };
      }
      pipeline.push({ $match: matchStage });

      // Add computed discount field
      pipeline.push({
        $addFields: {
          _discountPct: {
            $cond: {
              if: { $gt: ['$originalPrice', 0] },
              then: { $subtract: [1, { $divide: ['$outletPrice', '$originalPrice'] }] },
              else: 0,
            },
          },
        },
      });

      // Filter by min discount after computing it
      if (hasMinDiscount) {
        const minFrac = Number(minDiscount) / 100;
        pipeline.push({ $match: { _discountPct: { $gte: minFrac } } });
      }

      // Count via $facet
      const sortStage = {};
      if (sort === 'discount') {
        sortStage._discountPct = -1;
      } else if (sort === 'price_asc') {
        sortStage.outletPrice = 1;
      } else if (sort === 'price_desc') {
        sortStage.outletPrice = -1;
      } else if (hasText) {
        sortStage.score = { $meta: 'textScore' };
      } else {
        sortStage.firstSeenAt = -1;
      }

      pipeline.push({
        $facet: {
          data: [{ $sort: sortStage }, { $skip: skip }, { $limit: limitNum }, { $project: { _discountPct: 0 } }],
          count: [{ $count: 'total' }],
        },
      });

      const [result] = await Product.aggregate(pipeline);
      const products = result.data;
      const total = result.count[0]?.total || 0;

      return res.json({
        products,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        total,
      });
    }

    // Simple find() path — no discount computation needed
    const filter = {};
    if (hasText) {
      filter.$text = { $search: textQuery };
    }
    if (buyableOnline === 'true') {
      filter.buyableOnline = true;
    }
    if (minPrice && Number(minPrice) > 0) {
      filter.outletPrice = { ...filter.outletPrice, $gte: Number(minPrice) };
    }
    if (maxPrice && Number(maxPrice) > 0) {
      filter.outletPrice = { ...filter.outletPrice, $lte: Number(maxPrice) };
    }

    const sortMap = {
      price_asc: { outletPrice: 1 },
      price_desc: { outletPrice: -1 },
    };

    let sortOrder;
    if (sort && sortMap[sort]) {
      sortOrder = sortMap[sort];
    } else if (hasText) {
      sortOrder = { score: { $meta: 'textScore' } };
    } else {
      sortOrder = { firstSeenAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOrder).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total,
    });
  } catch (err) {
    console.error('Products route error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
