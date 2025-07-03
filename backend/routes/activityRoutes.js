const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// GET /api/logs
router.get('/', async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      include: User,
      order: [['timestamp', 'DESC']]
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs', error: err.message });
  }
});

module.exports = router;
