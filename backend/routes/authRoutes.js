const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ✅ Login route
router.post('/login', authController.login);

// ✅ Register route
router.post('/register', authController.register);

// ✅ Get all users (for dropdown)
router.get('/', async (req, res) => {
  try {
    const users = await require('../models/User').findAll({ attributes: ['id', 'name'] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
