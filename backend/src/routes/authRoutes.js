const express = require('express');
const { googleLogin } = require('../controllers/authController');

const router = express.Router();

// POST /api/v1/auth/google
router.post('/google', googleLogin);

module.exports = router;
