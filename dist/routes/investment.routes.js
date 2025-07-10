"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Investment_1 = __importDefault(require("../models/Investment"));
const Company_1 = __importDefault(require("../models/Company"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// 獲取所有投資項目
router.get('/', async (req, res) => {
    try {
        const investments = await Investment_1.default.findAll({
            include: [
                { model: Company_1.default, as: 'company' },
                { model: User_1.default, as: 'user' }
            ]
        });
        res.json(investments);
    }
    catch (error) {
        res.status(500).json({ error: '獲取投資項目失敗' });
    }
});
// 獲取單個投資項目
router.get('/:id', async (req, res) => {
    try {
        const investment = await Investment_1.default.findByPk(req.params.id, {
            include: [
                { model: Company_1.default, as: 'company' },
                { model: User_1.default, as: 'user' }
            ]
        });
        if (!investment) {
            return res.status(404).json({ error: '投資項目不存在' });
        }
        res.json(investment);
    }
    catch (error) {
        res.status(500).json({ error: '獲取投資項目失敗' });
    }
});
// 創建投資項目
router.post('/', async (req, res) => {
    try {
        const investment = await Investment_1.default.create(req.body);
        res.status(201).json(investment);
    }
    catch (error) {
        res.status(400).json({ error: '創建投資項目失敗' });
    }
});
// 更新投資項目
router.put('/:id', async (req, res) => {
    try {
        const investment = await Investment_1.default.findByPk(req.params.id);
        if (!investment) {
            return res.status(404).json({ error: '投資項目不存在' });
        }
        await investment.update(req.body);
        res.json(investment);
    }
    catch (error) {
        res.status(400).json({ error: '更新投資項目失敗' });
    }
});
// 刪除投資項目
router.delete('/:id', async (req, res) => {
    try {
        const investment = await Investment_1.default.findByPk(req.params.id);
        if (!investment) {
            return res.status(404).json({ error: '投資項目不存在' });
        }
        await investment.destroy();
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: '刪除投資項目失敗' });
    }
});
exports.default = router;
