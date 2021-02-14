const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

// /auth/register로 가면 authController.register 로드
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/update', authController.update);

module.exports = router;