const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  message: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'moderate', 'high'], 
    default: 'low' 
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);
