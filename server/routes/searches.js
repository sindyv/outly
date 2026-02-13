const express = require('express');
const Search = require('../models/Search');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const searches = await Search.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(searches);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { query, minDiscount, buyableOnline } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const discount = Number(minDiscount) || 0;
    if (discount < 0 || discount > 100) {
      return res.status(400).json({ error: 'minDiscount must be between 0 and 100' });
    }
    const search = await Search.create({
      userId: req.userId,
      query: query.trim(),
      minDiscount: discount,
      buyableOnline: !!buyableOnline,
    });
    res.status(201).json(search);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const search = await Search.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!search) {
      return res.status(404).json({ error: 'Search not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
