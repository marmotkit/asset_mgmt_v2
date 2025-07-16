"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';
const router = express_1.default.Router();
// 建立 PostgreSQL 連線池
const pool = new pg_1.Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
    } : false
});
// 獲取會員逾期繳款記錄
router.get('/member-overdue-payments', async (req, res) => {
    try {
        console.log('【風險管理】查詢會員逾期繳款記錄...');
        const query = `
            SELECT 
                f.id,
                f.member_id as "memberId",
                f.member_name as "memberName",
                f.member_no as "memberNo",
                f.member_type as "memberType",
                f.amount,
                f.due_date as "dueDate",
                f.status,
                f.note,
                f.created_at as "createdAt",
                f.updated_at as "updatedAt",
                EXTRACT(YEAR FROM f.due_date) as year,
                EXTRACT(MONTH FROM f.due_date) as month
            FROM fees f
            WHERE f.status = '逾期'
            ORDER BY f.due_date DESC
        `;
        const result = await pool.query(query);
        console.log(`【風險管理】找到 ${result.rows.length} 筆會員逾期繳款記錄`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('【風險管理】查詢會員逾期繳款記錄失敗:', error);
        res.status(500).json({
            error: '查詢會員逾期繳款記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});
// 獲取客戶租金逾期繳款記錄
router.get('/rental-overdue-payments', async (req, res) => {
    try {
        console.log('【風險管理】查詢客戶租金逾期繳款記錄...');
        const query = `
            SELECT 
                rp.id,
                rp."investmentId",
                rp.year,
                rp.month,
                rp.amount,
                rp.status,
                rp."startDate",
                rp."endDate",
                rp."renterName",
                rp."renterTaxId",
                rp."payerName",
                rp."paymentDate",
                rp."paymentMethod",
                rp."receiptNo",
                rp."hasInvoice",
                rp.note,
                rp."createdAt",
                rp."updatedAt"
            FROM rental_payments rp
            WHERE rp.status = 'late'
            ORDER BY rp.year DESC, rp.month DESC
        `;
        const result = await pool.query(query);
        console.log(`【風險管理】找到 ${result.rows.length} 筆客戶租金逾期繳款記錄`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('【風險管理】查詢客戶租金逾期繳款記錄失敗:', error);
        res.status(500).json({
            error: '查詢客戶租金逾期繳款記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});
// 獲取其他異常記錄
router.get('/anomalies', async (req, res) => {
    try {
        console.log('【風險管理】查詢其他異常記錄...');
        const query = `
            SELECT 
                id,
                type,
                person_id as "personId",
                person_name as "personName",
                description,
                occurrence_date as "occurrenceDate",
                status,
                handling_method as "handlingMethod",
                created_at as "createdAt",
                updated_at as "updatedAt"
            FROM anomalies
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query);
        console.log(`【風險管理】找到 ${result.rows.length} 筆其他異常記錄`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('【風險管理】查詢其他異常記錄失敗:', error);
        res.status(500).json({
            error: '查詢其他異常記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});
exports.default = router;
