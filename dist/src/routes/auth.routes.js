const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// 登入路由
router.post('/login', authController.login);

// 註冊路由
router.post('/register', authController.register);

module.exports = router; 