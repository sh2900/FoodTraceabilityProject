const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  farmerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  currentStage: { 
    type: String, 
    enum: ['farmer', 'warehouse', 'transporter', 'retailer'], 
    default: 'farmer' 
  },
  temperature: Number,
  humidity: Number,
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  status: { 
    type: String, 
    enum: ['Safe', 'Warning', 'Critical'], 
    default: 'Safe' 
  },
  history: [{
    stage: String,
    location: {
        lat: Number,
        lng: Number
    },
    timestamp: { type: Date, default: Date.now },
    status: String,
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    temperature: Number,
    humidity: Number,
    blockchainHash: String
  }],
  blockchainRecords: [{
    batchId: String,
    stage: String,
    timestamp: { type: Date, default: Date.now },
    hash: String
  }],
  specifications: {
    tempMin: { type: Number, default: 2 },
    tempMax: { type: Number, default: 8 },
    humidityMax: { type: Number, default: 85 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', BatchSchema);
