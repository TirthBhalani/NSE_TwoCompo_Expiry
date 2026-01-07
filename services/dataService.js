require('dotenv').config()
const axios = require('axios');
const Expiry = require('../models/Expiry'); 
const MarketData = require('../models/MarketData');

class DataService {
  constructor() {
    this.expiries = {
      NIFTY: [],
      BANKNIFTY: []
    };
  }

  // 1. Fetch Expiry Dates (Call this before market opens)
  async refreshExpiries(symbol) {
    try {
      console.log(process.env.EXPIRY_API_URL);
      const response = await axios.get(process.env.EXPIRY_API_URL, { params: { symbol } });
      
      // Keep existing fetch logic
      this.expiries[symbol] = response.data.expiryDates.slice(0, 6);
      console.log(`[${symbol}] Refreshed expiries:`, this.expiries[symbol]);

      // DATABASE STORAGE LOGIC
      const today = new Date().toISOString().split('T')[0];
      
      // Update the symbols array for today's record
      // This uses $pull and $push to ensure we don't have duplicate symbol entries in the array
      await Expiry.findOneAndUpdate(
        { date: today },
        { $pull: { symbols: { name: symbol } } }, 
        { upsert: true }
      );

      await Expiry.findOneAndUpdate(
        { date: today },
        { $push: { symbols: { name: symbol, expiries: this.expiries[symbol] } } }
      );

      console.log(`[${symbol}] Expiries saved to database for ${today}`);
    } catch (error) {
      console.error(`Error fetching/saving expiries for ${symbol}:`, error.message);
    }
  }

  // 2. Fetch Total OI for a specific symbol and expiry
  async getTotalOI(symbol, expiry) {
    try {
      const response = await axios.get(process.env.DATA_API_URL, { 
        params: { symbol, expiry } 
      });
      
      const records = response.data.records;
      
      // Keep existing return structure exactly as requested
      return {
        expiry,
        timestamp: records.timestamp,
        underlyingValue: records.underlyingValue,
        ceTotalOI: response.data.filtered.CE.totOI,
        peTotalOI: response.data.filtered.PE.totOI
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol} - ${expiry}:`, error.message);
      return null;
    }
  }

  // 3. Batch fetch for all active expiries
  async fetchAllActiveData() {
    const symbols = ['NIFTY', 'BANKNIFTY'];
    const results = {};
    const today = new Date().toISOString().split('T')[0];

    for (const symbol of symbols) {
      const tasks = this.expiries[symbol].map(expiry => this.getTotalOI(symbol, expiry));
      results[symbol] = await Promise.all(tasks);

      // DATABASE STORAGE LOGIC
      // Filter out failed API calls and map to your MarketData schema
      const validRecords = results[symbol]
        .filter(data => data !== null)
        .map(data => ({
          day: today,
          timestamp: new Date(data.timestamp), // Convert API string to Date object
          symbol: symbol,
          expiry: data.expiry,
          totalCeOI: data.ceTotalOI,
          totalPeOI: data.peTotalOI
        }));

      if (validRecords.length > 0) {
        try {
          await MarketData.insertMany(validRecords);
          console.log(`[DB] Inserted ${validRecords.length} MarketData records for ${symbol}`);
        } catch (dbError) {
          console.error(`[DB] Error inserting MarketData for ${symbol}:`, dbError.message);
        }
      }
    }
    
    console.log(`Data fetched and stored at ${new Date().toISOString()}`);
    return results;
  }
}

module.exports = new DataService();