const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const checkRole = require('../middleware/role');
const Batch = require('../models/Batch');
const Alert = require('../models/Alert');
const { storeOnBlockchain } = require('../utils/blockchain');
const crypto = require('crypto');
const { sendAlertEmail } = require('../utils/mailer');

// @route    POST api/product/create
// @desc     Create a batch (Farmer or Admin)
router.post('/create', [auth, checkRole(['farmer', 'admin'])], async (req, res) => {
  const { batchId, productName, quantity, location, temperature, humidity } = req.body;

  console.log(`Creating batch: ${batchId} for farmer: ${req.user.id}`);

  try {
    if (!batchId) return res.status(400).json({ msg: 'Batch ID is required' });

    let batch = await Batch.findOne({ batchId });
    if (batch) return res.status(400).json({ msg: 'Batch already exists' });

    // Validate numbers
    const validQty = isNaN(parseInt(quantity)) ? 0 : parseInt(quantity);
    const validTemp = isNaN(parseFloat(temperature)) ? 4 : parseFloat(temperature);
    const validHumid = isNaN(parseFloat(humidity)) ? 60 : parseFloat(humidity);

    batch = new Batch({
      batchId,
      productName: productName || 'Unknown Product',
      quantity: validQty,
      farmerID: req.user.id,
      ownerID: req.user.id,
      currentStage: 'farmer',
      location: location || { lat: 0, lng: 0 },
      temperature: validTemp,
      humidity: validHumid,
      status: 'Safe'
    });

    // Initial history entry
    batch.history.push({
      stage: 'farmer',
      location: location || { lat: 0, lng: 0 },
      status: 'Initialized',
      actor: req.user.id,
      temperature: validTemp,
      humidity: validHumid,
      timestamp: new Date()
    });

    // Blockchain record
    try {
      const dataToHash = JSON.stringify({ batchId, stage: 'farmer', timestamp: new Date().toISOString() });
      const simulatedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
      let realHash = await storeOnBlockchain(batchId, simulatedHash);
      
      batch.blockchainRecords.push({
        batchId,
        stage: 'farmer',
        timestamp: new Date(),
        hash: realHash || simulatedHash
      });
    } catch (bcErr) {
      console.error("Blockchain pre-storage error:", bcErr);
    }

    await batch.save();
    console.log(`Batch ${batchId} saved successfully`);
    res.json(batch);
  } catch (err) {
    const fs = require('fs');
    const path = require('path');
    const errorLog = `[${new Date().toISOString()}] FULL ERROR IN /CREATE:\n${err.stack}\n\n`;
    fs.appendFileSync(path.join(__dirname, '../../debug_error.txt'), errorLog);
    
    console.error("FULL ERROR IN /CREATE:", err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route    POST api/product/update
// @desc     Update batch status/sensors (Farmer, Transporter, Warehouse, Retailer)
router.post('/update', [auth, checkRole(['farmer', 'transporter', 'warehouse', 'retailer'])], async (req, res) => {
  const { batchId, location, temperature, humidity, currentStage } = req.body;

  try {
    let batch = await Batch.findOne({ batchId });
    if (!batch) return res.status(404).json({ msg: 'Batch not found' });

    // Enforce ownership unless admin
    if (batch.ownerID && batch.ownerID.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'You do not have custody of this batch. Claim it first.' });
    }

    // ALERT SYSTEM LOGIC
    // temp <= 5 -> Safe
    // temp between 5–8 -> Warning
    // temp > 8 -> Critical
    let status = 'Safe';
    if (temperature > 8) {
      status = 'Critical';
    } else if (temperature > 5) {
      status = 'Warning';
    }

    if (status !== 'Safe') {
      const alert = new Alert({
        productId: batchId,
        message: `${status} temperature detected: ${temperature}°C at stage ${currentStage || batch.currentStage}`,
        severity: status === 'Critical' ? 'high' : 'moderate'
      });
      await alert.save();
      
      // Trigger email if Critical
      if (status === 'Critical') {
        // Send email asynchronously without blocking the API response
        sendAlertEmail(batchId, temperature, currentStage || batch.currentStage);
      }
    }

    // BLOCKCHAIN INTEGRATION
    const dataToHash = JSON.stringify({ batchId, stage: currentStage, temperature, humidity, timestamp: new Date() });
    const simulatedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    let realHash = await storeOnBlockchain(batchId, simulatedHash);

    // Update batch
    batch.location = location || batch.location;
    batch.temperature = temperature;
    batch.humidity = humidity;
    batch.status = status;
    
    // If the stage is changing, release ownership for the next party to claim
    if (currentStage && currentStage !== batch.currentStage) {
      batch.currentStage = currentStage;
      batch.ownerID = null; 
    }

    batch.history.push({
      stage: currentStage || batch.currentStage,
      location: location || batch.location,
      status: status,
      actor: req.user.id,
      temperature,
      humidity,
      blockchainHash: realHash || simulatedHash,
      timestamp: new Date()
    });

    batch.blockchainRecords.push({
      batchId,
      stage: currentStage || batch.currentStage,
      timestamp: new Date(),
      hash: realHash || simulatedHash
    });

    await batch.save();
    res.json(batch);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/product/claim
// @desc     Claim custody of a batch
router.post('/claim', [auth, checkRole(['warehouse', 'transporter', 'retailer'])], async (req, res) => {
  const { batchId } = req.body;
  try {
    let batch = await Batch.findOne({ batchId });
    if (!batch) return res.status(404).json({ msg: 'Batch not found' });

    if (batch.ownerID) {
      return res.status(400).json({ msg: 'Batch is already claimed by another user' });
    }

    batch.ownerID = req.user.id;
    batch.history.push({
      stage: batch.currentStage,
      location: batch.location,
      status: batch.status,
      actor: req.user.id,
      temperature: batch.temperature,
      humidity: batch.humidity,
      timestamp: new Date()
    });

    await batch.save();
    res.json(batch);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/product/public/:id
// @desc     Public Verification API for consumers
// @access   Public
router.get('/public/:id', async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.id }).populate('farmerID', 'username');
    if (!batch) return res.status(404).json({ msg: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/product/:id
// @desc     Get batch by ID (Authenticated)
router.get('/:id', auth, async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.id }).populate('farmerID', 'username');
    if (!batch) return res.status(404).json({ msg: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/product/my/products
// @desc     Get batches (Filtered by role)
router.get('/my/products', auth, async (req, res) => {
  try {
    let query = {};
    const role = req.user.role.toLowerCase();

    if (role === 'farmer') {
      query = { farmerID: req.user.id };
    } else if (role === 'warehouse') {
      query = { currentStage: 'warehouse' };
    } else if (role === 'transporter') {
      query = { currentStage: 'transporter' };
    } else if (role === 'retailer' || role === 'admin') {
      query = {}; // Retailer and Admin see everything
    }

    const batches = await Batch.find(query).populate('farmerID', 'username');
    res.json(batches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/product/all/list
// @desc     Get all batches (Alias for compatibility)
router.get('/all/list', auth, async (req, res) => {
    try {
      const role = req.user.role.toLowerCase();
      let query = {};
      
      if (role === 'warehouse') {
        query = { currentStage: 'warehouse' };
      } else if (role === 'transporter') {
        query = { currentStage: 'transporter' };
      }

      const batches = await Batch.find(query).populate('farmerID', 'username');
      res.json(batches);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

module.exports = router;
