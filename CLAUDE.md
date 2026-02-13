# CLAUDE.md

## Project: Elkjøp Outlet Tracker

Full-stack web app that scrapes Elkjøp's outlet API, stores products in MongoDB, and notifies users via email when new products match their saved searches.

## Tech Stack

- **Backend**: Express, Mongoose, JWT auth, node-cron, Nodemailer
- **Frontend**: React + Vite, React Router
- **Database**: MongoDB

## Commands

```bash
# Install all dependencies
npm install && npm install --prefix client

# Run both server and client (dev)
npm run dev

# Run server only
npm run server

# Run client only
npm run client
```

## Environment Setup

Copy `.env.example` to `.env` and fill in values:
- `MONGODB_URI` — MongoDB connection string (default: `mongodb://localhost:27017/elkjop-outlet`)
- `JWT_SECRET` — Secret for signing JWTs
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — Email config (optional, notifications skipped if not set)

## Architecture

```
server/
  index.js            — Express entry point (port 5000)
  config/db.js        — MongoDB connection
  models/             — Mongoose schemas (User, Product, Search)
  routes/             — API routes (auth, products, searches)
  middleware/auth.js   — JWT verification
  services/scraper.js  — Elkjøp outlet API scraper
  services/notifier.js — Email notification sender
  jobs/scrapeJob.js    — Hourly cron job: scrape, upsert, notify

client/
  src/App.jsx          — React Router setup
  src/context/         — AuthContext (JWT in localStorage)
  src/pages/           — Products, Searches, Login, Register
  src/components/      — Navbar, ProductCard, SearchForm
```

## API Endpoints

- `POST /api/auth/register` — Register (email, password)
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/products?q=&page=&limit=` — Search/browse products (text index on name+brand)
- `GET /api/searches` — List saved searches (auth required)
- `POST /api/searches` — Create saved search (auth required)
- `DELETE /api/searches/:id` — Delete saved search (auth required)

## Code Style

- Server: CommonJS (`require`/`module.exports`)
- Client: ES modules, functional React components with hooks
- No TypeScript
