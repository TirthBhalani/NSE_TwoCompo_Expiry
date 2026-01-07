const mongoose = require('mongoose');

const ExpirySchema = new mongoose.Schema({
  date: { 
    type: String, 
    required: true, 
    unique: true // Ensures only one record per day (YYYY-MM-DD)
  },
  symbols: [
    {
      name: { type: String, required: true }, // e.g., "NIFTY"
      expiries: [String]                      // e.g., ["2026-01-08", "2026-01-15"]
    }
  ]
});

module.exports = mongoose.models.Expiry || mongoose.model('Expiry', ExpirySchema);