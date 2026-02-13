const SEARCH_URL = 'https://www.elkjop.no/api/search';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapePage(page) {
  const body = {
    path: '/outlet',
    pageSearch: {
      filter: ['Product_Taxonomy.ID:PT793'],
      ...(page > 1 ? { page } : {}),
    },
    contentQuery: 'Outlet',
    categories: ['Outlet'],
    userQuery: {},
  };
  const res = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Elkjøp API error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

function mapRecord(record) {
  const prices = record.price?.current || [];
  const aPrices = record.aPrice || [];
  return {
    sku: record.sku,
    name: record.name || '',
    brand: record.brand || '',
    outletPrice: prices[0] ?? null,
    originalPrice: aPrices[0] ?? prices[0] ?? null,
    href: record.href || '',
    imageUrl: record.imageUrl || '',
    bGrade: !!record.bGrade,
    bulletPoints: record.bulletPoints || [],
    category: record.taxonomy?.[0] || '',
    storeStock: record.storeStock || null,
    buyableOnline: record.sellability?.isBuyableOnline ?? false,
  };
}

async function scrapeAll() {
  console.log('Starting Elkjøp outlet scrape...');
  const firstPage = await scrapePage(1);
  const pageCount = firstPage.paging?.pageCount || 1;
  const allRecords = (firstPage.records || []).map(mapRecord);

  console.log(`Found ${pageCount} pages to scrape (${firstPage.totalHits} total products)`);

  for (let page = 2; page <= pageCount; page++) {
    await delay(500);
    try {
      const data = await scrapePage(page);
      const mapped = (data.records || []).map(mapRecord);
      allRecords.push(...mapped);
      if (page % 10 === 0) {
        console.log(`Scraped page ${page}/${pageCount} (${allRecords.length} products so far)`);
      }
    } catch (err) {
      console.error(`Error scraping page ${page}:`, err.message);
    }
  }

  console.log(`Scrape complete: ${allRecords.length} products`);
  return allRecords;
}

module.exports = { scrapeAll };
