const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Alert = require('../models/Alert');

// @route    GET api/alert
// @desc     Get all alerts
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
