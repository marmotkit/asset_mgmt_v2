import { Router } from 'express';
import * as companyController from '../controllers/companyController';
import { authMiddleware, adminAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// 獲取所有公司 (需要身份驗證)
router.get('/', authMiddleware, companyController.getAllCompanies);

// 獲取單個公司 (需要身份驗證)
router.get('/:id', authMiddleware, companyController.getCompanyById);

// 創建公司 (需要管理員權限)
router.post('/', adminAuthMiddleware, companyController.createCompany);

// 更新公司 (需要管理員權限)
router.put('/:id', adminAuthMiddleware, companyController.updateCompany);

// 刪除公司 (需要管理員權限)
router.delete('/:id', adminAuthMiddleware, companyController.deleteCompany);

export default router; 