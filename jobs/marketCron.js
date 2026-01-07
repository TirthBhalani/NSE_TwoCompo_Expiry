require('dotenv').config()
const cron = require('node-cron');
const dataService = require('../services/dataService');

const startScheduler = () => {
  // 1. Refresh expiries at 9:00 AM IST before market opens
  cron.schedule('0 0 9 * * *', () => {
    dataService.refreshExpiries('NIFTY');
    dataService.refreshExpiries('BANKNIFTY');
  }, { timezone: "Asia/Kolkata" });

  // 2. Fetch OI every minute at exactly :00 seconds
  // Pattern: (seconds) (minutes) (hours) (day of month) (month) (day of week)
  cron.schedule('0 * 9-15 * * 1-5', () => {
    // This runs every minute at 00s from 9 AM to 3:59 PM, Mon-Fri
    dataService.fetchAllActiveData();
  }, { timezone: "Asia/Kolkata" });
  
  console.log("Scheduler initialized for IST Market Hours.");
  cron.schedule('0 * 9-15 * * 1-5', async () => {
  const now = new Date();
  // Logs the exact time in IST to the millisecond
  const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  console.log(`[CRON TRIGGERED] at: ${istString}:${now.getMilliseconds()}ms`);
  
  await dataService.fetchAllActiveData();
}, { timezone: "Asia/Kolkata" });
};

module.exports = startScheduler;