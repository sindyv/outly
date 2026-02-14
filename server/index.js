require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const searchRoutes = require('./routes/searches');
const adminRoutes = require('./routes/admin');
const { startScrapeJob } = require('./jobs/scrapeJob');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/searches', searchRoutes);
app.use('/api/admin', adminRoutes);

async function start() {
  await connectDB();

  if (process.env.ADMIN_EMAIL) {
    await User.findOneAndUpdate(
      { email: process.env.ADMIN_EMAIL.toLowerCase() },
      { $set: { role: 'admin' } }
    );
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  startScrapeJob();
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
