const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getBlockchainLogs, getAllBlockchainLogs } = require('../utils/blockchain');

// @route    GET api/blockchain/logs/all
// @desc     Get all blockchain logs
router.get('/logs/all', auth, async (req, res) => {
  try {
    const logs = await getAllBlockchainLogs();
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/blockchain/logs/:productId
// @desc     Get blockchain logs for a product
router.get('/logs/:productId', auth, async (req, res) => {
  try {
    const logs = await getBlockchainLogs(req.params.productId);
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
