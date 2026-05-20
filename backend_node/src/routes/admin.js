const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// @route    GET api/admin/users/pending
// @desc     Get all pending users
// @access   Private (Admin)
router.get('/users/pending', [auth, authorize(['admin'])], async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false }).select('-password');
    res.json(pendingUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    PUT api/admin/users/approve/:id
// @desc     Approve a pending user
// @access   Private (Admin)
router.put('/users/approve/:id', [auth, authorize(['admin'])], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ msg: 'User approved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
