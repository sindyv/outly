const cron = require('node-cron');
const Product = require('../models/Product');
const Search = require('../models/Search');
const ScrapeLog = require('../models/ScrapeLog');
const { scrapeAll } = require('../services/scraper');
const { sendNewProductsEmail } = require('../services/notifier');

async function runScrape() {
  const startedAt = new Date();

  try {
    const products = await scrapeAll();
    const newProducts = [];
    const scrapedSkus = new Set();

    for (const product of products) {
      scrapedSkus.add(product.sku);

      const result = await Product.findOneAndUpdate(
        { sku: product.sku },
        {
          $set: {
            name: product.name,
            brand: product.brand,
            outletPrice: product.outletPrice,
            originalPrice: product.originalPrice,
            href: product.href,
            imageUrl: product.imageUrl,
            bGrade: product.bGrade,
            bulletPoints: product.bulletPoints,
            category: product.category,
            storeStock: product.storeStock,
            buyableOnline: product.buyableOnline,
          },
          $setOnInsert: {
            firstSeenAt: new Date(),
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true, rawResult: true }
      );

      if (result.lastErrorObject && !result.lastErrorObject.updatedExisting) {
        newProducts.push(result.value);
      }
    }

    // Count products in DB whose SKU was not in this scrape
    const removedCount = await Product.countDocuments({
      sku: { $nin: Array.from(scrapedSkus) },
    });

    // Log the scrape result
    await ScrapeLog.create({
      startedAt,
      finishedAt: new Date(),
      status: 'success',
      totalProducts: products.length,
      newProducts: newProducts.length,
      removedProducts: removedCount,
    });

    console.log(`Upserted ${products.length} products, ${newProducts.length} new, ${removedCount} removed`);

    if (newProducts.length === 0) return;

    // Match new products against saved searches
    const searches = await Search.find().populate('userId');
    const userMatches = new Map(); // userId -> Set of products

    for (const search of searches) {
      if (!search.userId) continue;
      const queryTerms = search.query.toLowerCase().split(/\s+/).filter(Boolean);

      for (const product of newProducts) {
        const text = `${product.name} ${product.brand}`.toLowerCase();
        const textMatch = queryTerms.every((term) => text.includes(term));
        if (!textMatch) continue;

        if (search.buyableOnline && !product.buyableOnline) continue;

        if (search.minDiscount > 0 && product.originalPrice > 0) {
          const discount = (1 - product.outletPrice / product.originalPrice) * 100;
          if (discount < search.minDiscount) continue;
        }

        {
          const userId = search.userId._id.toString();
          if (!userMatches.has(userId)) {
            userMatches.set(userId, { email: search.userId.email, products: new Set() });
          }
          userMatches.get(userId).products.add(product);
        }
      }
    }

    // Send emails
    for (const [, { email, products: matchedSet }] of userMatches) {
      const matched = Array.from(matchedSet);
      if (matched.length > 0) {
        await sendNewProductsEmail(email, matched);
      }
    }
  } catch (err) {
    console.error('Scrape job error:', err);

    await ScrapeLog.create({
      startedAt,
      finishedAt: new Date(),
      status: 'failed',
      error: err.message || String(err),
    }).catch(() => {}); // Don't let logging failure mask the original error
  }
}

function startScrapeJob() {
  // Run every hour
  cron.schedule('0 * * * *', () => {
    console.log('Cron: starting scheduled scrape');
    runScrape();
  });
  console.log('Scrape cron job scheduled (every hour)');

  // Also run once on startup (after a short delay)
  setTimeout(() => {
    console.log('Running initial scrape...');
    runScrape();
  }, 5000);
}

module.exports = { startScrapeJob, runScrape };
