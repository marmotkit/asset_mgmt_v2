import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

// 登入路由
router.post('/login', authController.login);

// 註冊路由
router.post('/register', authController.register);

export default router; 