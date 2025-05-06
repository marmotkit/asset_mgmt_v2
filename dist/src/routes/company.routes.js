const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middlewares/auth');
const Company = require('../models/Company');
const { UserRole } = require('../models/User');

// 獲取所有公司
router.get('/', authMiddleware, async (req, res) => {
    try {
        const companies = await Company.findAll();
        res.json(companies);
    } catch (error) {
        console.error('獲取公司列表錯誤', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 獲取單個公司
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByPk(id);

        if (!company) {
            return res.status(404).json({ message: '公司不存在' });
        }

        res.json(company);
    } catch (error) {
        console.error('獲取公司詳情錯誤', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 創建公司 (僅限管理員)
router.post('/', authMiddleware, checkRole([UserRole.ADMIN]), async (req, res) => {
    try {
        // 生成公司編號
        const companies = await Company.findAll();
        const count = companies.length;
        const companyNo = `A${String(count + 1).padStart(3, '0')}`;

        const newCompany = await Company.create({
            ...req.body,
            companyNo
        });

        res.status(201).json(newCompany);
    } catch (error) {
        console.error('創建公司錯誤', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 更新公司 (僅限管理員)
router.put('/:id', authMiddleware, checkRole([UserRole.ADMIN]), async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByPk(id);

        if (!company) {
            return res.status(404).json({ message: '公司不存在' });
        }

        // 不允許修改公司編號
        delete req.body.companyNo;

        await company.update(req.body);

        res.json(company);
    } catch (error) {
        console.error('更新公司錯誤', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 刪除公司 (僅限管理員)
router.delete('/:id', authMiddleware, checkRole([UserRole.ADMIN]), async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByPk(id);

        if (!company) {
            return res.status(404).json({ message: '公司不存在' });
        }

        await company.destroy();

        res.json({ message: '公司已成功刪除' });
    } catch (error) {
        console.error('刪除公司錯誤', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

module.exports = router; 