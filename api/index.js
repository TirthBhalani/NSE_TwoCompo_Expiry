// api/index.js
const express = require('express');
const connectDB = require('../config/db');
const dataService = require('../services/dataService');
const app = express();

// Do NOT call startScheduler() or initial fetch here. 
// They won't run consistently in serverless.

app.get('/api/refresh', async (req, res) => {
    try {
        await connectDB();
        await dataService.refreshExpiries('NIFTY');
        await dataService.refreshExpiries('BANKNIFTY');
        res.status(200).send("Expiries Refreshed");
    } catch (e) { res.status(500).send(e.message); }
});

app.get('/api/fetch-oi', async (req, res) => {
  // Check for a secret key in the headers or query string
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send("Unauthorized");
  }

  try {
    await connectDB();
    const results = await dataService.fetchAllActiveData();
    res.status(200).json({ success: true, timestamp: new Date() });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = app; // Essential for Vercel