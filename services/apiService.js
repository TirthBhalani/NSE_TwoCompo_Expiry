const axios = require('axios');

/**
 * Fetches the list of expiries for your symbols (NIFTY/BANKNIFTY).
 * We assume your API returns an object or array containing the symbols and their dates.
 */
const fetchDailyExpiries = async () => {
  try {
    const response = await axios.get(process.env.EXPIRY_API_URL, {
      headers: { 'Authorization': `Bearer ${process.env.MARKET_API_KEY}` }
    });

    // NOTE: You might need to map the response here to match your schema:
    // Expected: [{ name: "NIFTY", expiries: ["2026-01-15", ...] }, ...]
    return response.data; 
  } catch (error) {
    console.error("API Error (Expiries):", error.message);
    throw new Error("Failed to fetch fresh expiries from external API");
  }
};

/**
 * Fetches the specific OI data for a given symbol and expiry.
 */
const fetchMarketOI = async (symbol, expiry) => {
  try {
    const response = await axios.get(process.env.OI_API_URL, {
      params: { symbol, expiry },
      headers: { 'Authorization': `Bearer ${process.env.MARKET_API_KEY}` }
    });

    // Standardize the result so the Database Service can save it easily
    return {
      symbol: symbol,
      expiry: expiry,
      totalCeOI: response.data.totalCeOI, // Adjust based on your API's key names
      totalPeOI: response.data.totalPeOI
    };
  } catch (error) {
    console.error(`API Error (OI for ${symbol}-${expiry}):`, error.message);
    return null; // Return null if one fails so the whole batch doesn't crash
  }
};

module.exports = {
  fetchDailyExpiries,
  fetchMarketOI
};