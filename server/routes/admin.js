const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Search = require('../models/Search');
const ScrapeLog = require('../models/ScrapeLog');

const router = express.Router();

router.use(auth, admin);

// List users with pagination
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}, 'email role createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    const userIds = users.map((u) => u._id);
    const searchCounts = await Search.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(searchCounts.map((s) => [s._id.toString(), s.count]));

    const data = users.map((u) => ({
      _id: u._id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      searchCount: countMap[u._id.toString()] || 0,
    }));

    res.json({ users: data, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { role, email } = req.body;
    const update = {};
    if (role && ['user', 'admin'].includes(role)) update.role = role;
    if (email) update.email = email.toLowerCase();

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ _id: user._id, email: user.email, role: user.role, createdAt: user.createdAt });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user + their searches
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await Search.deleteMany({ userId: user._id });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Product statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalProducts, totalUsers, productsToday, discountAgg, categoryAgg, discountDist, dailyAgg, lastScrape] =
      await Promise.all([
        Product.countDocuments(),
        User.countDocuments(),
        Product.countDocuments({ createdAt: { $gte: todayStart } }),
        Product.aggregate([
          { $match: { originalPrice: { $gt: 0 }, outletPrice: { $gt: 0 } } },
          {
            $group: {
              _id: null,
              avgDiscount: {
                $avg: {
                  $multiply: [{ $divide: [{ $subtract: ['$originalPrice', '$outletPrice'] }, '$originalPrice'] }, 100],
                },
              },
            },
          },
        ]),
        Product.aggregate([
          { $match: { category: { $ne: '' } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
        Product.aggregate([
          { $match: { originalPrice: { $gt: 0 }, outletPrice: { $gt: 0 } } },
          {
            $project: {
              discount: {
                $multiply: [{ $divide: [{ $subtract: ['$originalPrice', '$outletPrice'] }, '$originalPrice'] }, 100],
              },
            },
          },
          {
            $bucket: {
              groupBy: '$discount',
              boundaries: [0, 20, 40, 60, 80, 100],
              default: 'other',
              output: { count: { $sum: 1 } },
            },
          },
        ]),
        Product.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        ScrapeLog.findOne().sort({ startedAt: -1 }).lean(),
      ]);

    const bucketLabels = { 0: '0-20%', 20: '20-40%', 40: '40-60%', 60: '60-80%', 80: '80-100%' };
    const discountDistribution = discountDist
      .filter((b) => b._id !== 'other')
      .map((b) => ({ label: bucketLabels[b._id] || `${b._id}%+`, count: b.count }));

    res.json({
      totalProducts,
      totalUsers,
      productsToday,
      avgDiscount: discountAgg[0]?.avgDiscount ? Math.round(discountAgg[0].avgDiscount * 10) / 10 : 0,
      topCategories: categoryAgg.map((c) => ({ category: c._id, count: c.count })),
      discountDistribution,
      productsPerDay: dailyAgg.map((d) => ({ date: d._id, count: d.count })),
      lastScrape: lastScrape || null,
      removedProducts: lastScrape?.removedProducts || 0,
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Scrape logs
router.get('/scrape-logs', async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const logs = await ScrapeLog.find().sort({ startedAt: -1 }).limit(limit).lean();
    res.json(logs);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
