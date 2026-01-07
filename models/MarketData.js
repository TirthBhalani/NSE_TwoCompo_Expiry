const mongoose = require('mongoose');

const MarketDataSchema = new mongoose.Schema({
  day: { 
    type: String, 
    required: true // Format: YYYY-MM-DD
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  symbol: { 
    type: String, 
    required: true 
  },
  expiry: { 
    type: String, 
    required: true 
  },
  totalCeOI: { 
    type: Number, 
    required: true 
  },
  totalPeOI: { 
    type: Number, 
    required: true 
  }
});

// INDEXING: Day is the top-level filter for the dashboard
// This allows the DB to "discard" all data from other days immediately.
MarketDataSchema.index({ day: 1, symbol: 1, expiry: 1 });

// Optional: secondary index for time-series sorting within the dashboard
MarketDataSchema.index({ timestamp: -1 });

module.exports = mongoose.models.MarketData || mongoose.model('MarketData', MarketDataSchema);