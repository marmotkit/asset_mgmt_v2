"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connection_1 = __importDefault(require("../db/connection"));
const router = express_1.default.Router();
// 取得損益表
router.get('/income-statement', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: '開始日期和結束日期為必填參數' });
        }
        // 取得收入科目餘額
        const [revenue] = await connection_1.default.query(`
            SELECT 
                a.account_code,
                a.account_name,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as credit_amount,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as debit_amount,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as balance
            FROM accounting_accounts a
            LEFT JOIN accounting_journal j ON (a.id = j.debit_account_id OR a.id = j.credit_account_id)
            WHERE a.account_type = 'revenue' 
            AND a.is_active = true
            AND j.journal_date BETWEEN $1 AND $2
            GROUP BY a.id, a.account_code, a.account_name
            HAVING COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                   COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) != 0
            ORDER BY a.account_code
        `, { bind: [startDate, endDate] });
        // 取得費用科目餘額
        const [expenses] = await connection_1.default.query(`
            SELECT 
                a.account_code,
                a.account_name,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as debit_amount,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as credit_amount,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as balance
            FROM accounting_accounts a
            LEFT JOIN accounting_journal j ON (a.id = j.debit_account_id OR a.id = j.credit_account_id)
            WHERE a.account_type = 'expense' 
            AND a.is_active = true
            AND j.journal_date BETWEEN $1 AND $2
            GROUP BY a.id, a.account_code, a.account_name
            HAVING COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                   COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) != 0
            ORDER BY a.account_code
        `, { bind: [startDate, endDate] });
        // 計算總收入
        const totalRevenue = revenue.reduce((sum, item) => sum + parseFloat(item.balance), 0);
        // 計算總費用
        const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.balance), 0);
        // 計算淨利
        const netIncome = totalRevenue - totalExpenses;
        res.json({
            period: { startDate, endDate },
            revenue: {
                items: revenue,
                total: totalRevenue
            },
            expenses: {
                items: expenses,
                total: totalExpenses
            },
            netIncome
        });
    }
    catch (error) {
        console.error('取得損益表時發生錯誤:', error);
        res.status(500).json({ error: '取得損益表失敗' });
    }
});
// 取得資產負債表
router.get('/balance-sheet', async (req, res) => {
    try {
        const { asOfDate } = req.query;
        if (!asOfDate) {
            return res.status(400).json({ error: '截止日期為必填參數' });
        }
        // 取得資產科目餘額
        const [assets] = await connection_1.default.query(`
            SELECT 
                a.account_code,
                a.account_name,
                a.account_type,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as debit_amount,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as credit_amount,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as balance
            FROM accounting_accounts a
            LEFT JOIN accounting_journal j ON (a.id = j.debit_account_id OR a.id = j.credit_account_id)
            WHERE a.account_type IN ('asset', 'current_asset', 'fixed_asset') 
            AND a.is_active = true
            AND j.journal_date <= $1
            GROUP BY a.id, a.account_code, a.account_name, a.account_type
            HAVING COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                   COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) != 0
            ORDER BY a.account_code
        `, { bind: [asOfDate] });
        // 取得負債科目餘額
        const [liabilities] = await connection_1.default.query(`
            SELECT 
                a.account_code,
                a.account_name,
                a.account_type,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as credit_amount,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as debit_amount,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as balance
            FROM accounting_accounts a
            LEFT JOIN accounting_journal j ON (a.id = j.debit_account_id OR a.id = j.credit_account_id)
            WHERE a.account_type IN ('liability', 'current_liability', 'long_term_liability') 
            AND a.is_active = true
            AND j.journal_date <= $1
            GROUP BY a.id, a.account_code, a.account_name, a.account_type
            HAVING COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                   COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) != 0
            ORDER BY a.account_code
        `, { bind: [asOfDate] });
        // 取得權益科目餘額
        const [equity] = await connection_1.default.query(`
            SELECT 
                a.account_code,
                a.account_name,
                a.account_type,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as credit_amount,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as debit_amount,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as balance
            FROM accounting_accounts a
            LEFT JOIN accounting_journal j ON (a.id = j.debit_account_id OR a.id = j.credit_account_id)
            WHERE a.account_type IN ('equity', 'capital', 'retained_earnings') 
            AND a.is_active = true
            AND j.journal_date <= $1
            GROUP BY a.id, a.account_code, a.account_name, a.account_type
            HAVING COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                   COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) != 0
            ORDER BY a.account_code
        `, { bind: [asOfDate] });
        // 計算總資產
        const totalAssets = assets.reduce((sum, item) => sum + parseFloat(item.balance), 0);
        // 計算總負債
        const totalLiabilities = liabilities.reduce((sum, item) => sum + parseFloat(item.balance), 0);
        // 計算總權益
        const totalEquity = equity.reduce((sum, item) => sum + parseFloat(item.balance), 0);
        res.json({
            asOfDate,
            assets: {
                items: assets,
                total: totalAssets
            },
            liabilities: {
                items: liabilities,
                total: totalLiabilities
            },
            equity: {
                items: equity,
                total: totalEquity
            },
            totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
            balanceCheck: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
        });
    }
    catch (error) {
        console.error('取得資產負債表時發生錯誤:', error);
        res.status(500).json({ error: '取得資產負債表失敗' });
    }
});
// 取得現金流量表
router.get('/cash-flow', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: '開始日期和結束日期為必填參數' });
        }
        // 營業活動現金流量
        const [operatingActivities] = await connection_1.default.query(`
            SELECT 
                a.account_code,
                a.account_name,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as cash_outflow,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as cash_inflow,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as net_cash_flow
            FROM accounting_accounts a
            LEFT JOIN accounting_journal j ON (a.id = j.debit_account_id OR a.id = j.credit_account_id)
            WHERE a.account_type IN ('revenue', 'expense', 'current_asset', 'current_liability')
            AND a.is_active = true
            AND j.journal_date BETWEEN $1 AND $2
            GROUP BY a.id, a.account_code, a.account_name
            HAVING COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                   COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) != 0
            ORDER BY a.account_code
        `, { bind: [startDate, endDate] });
        // 投資活動現金流量
        const [investingActivities] = await connection_1.default.query(`
            SELECT 
                a.account_code,
                a.account_name,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as cash_outflow,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as cash_inflow,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as net_cash_flow
            FROM accounting_accounts a
            LEFT JOIN accounting_journal j ON (a.id = j.debit_account_id OR a.id = j.credit_account_id)
            WHERE a.account_type IN ('fixed_asset', 'investment')
            AND a.is_active = true
            AND j.journal_date BETWEEN $1 AND $2
            GROUP BY a.id, a.account_code, a.account_name
            HAVING COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                   COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) != 0
            ORDER BY a.account_code
        `, { bind: [startDate, endDate] });
        // 籌資活動現金流量
        const [financingActivities] = await connection_1.default.query(`
            SELECT 
                a.account_code,
                a.account_name,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as cash_outflow,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as cash_inflow,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as net_cash_flow
            FROM accounting_accounts a
            LEFT JOIN accounting_journal j ON (a.id = j.debit_account_id OR a.id = j.credit_account_id)
            WHERE a.account_type IN ('equity', 'capital', 'long_term_liability')
            AND a.is_active = true
            AND j.journal_date BETWEEN $1 AND $2
            GROUP BY a.id, a.account_code, a.account_name
            HAVING COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                   COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) != 0
            ORDER BY a.account_code
        `, { bind: [startDate, endDate] });
        // 計算各類現金流量總額
        const operatingCashFlow = operatingActivities.reduce((sum, item) => sum + parseFloat(item.net_cash_flow), 0);
        const investingCashFlow = investingActivities.reduce((sum, item) => sum + parseFloat(item.net_cash_flow), 0);
        const financingCashFlow = financingActivities.reduce((sum, item) => sum + parseFloat(item.net_cash_flow), 0);
        const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
        res.json({
            period: { startDate, endDate },
            operatingActivities: {
                items: operatingActivities,
                total: operatingCashFlow
            },
            investingActivities: {
                items: investingActivities,
                total: investingCashFlow
            },
            financingActivities: {
                items: financingActivities,
                total: financingCashFlow
            },
            netCashFlow
        });
    }
    catch (error) {
        console.error('取得現金流量表時發生錯誤:', error);
        res.status(500).json({ error: '取得現金流量表失敗' });
    }
});
// 取得科目餘額表
router.get('/trial-balance', async (req, res) => {
    try {
        const { asOfDate } = req.query;
        if (!asOfDate) {
            return res.status(400).json({ error: '截止日期為必填參數' });
        }
        const [trialBalance] = await connection_1.default.query(`
            SELECT 
                a.account_code,
                a.account_name,
                a.account_type,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as total_debit,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as total_credit,
                CASE 
                    WHEN a.account_type IN ('asset', 'expense') THEN
                        COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                        COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0)
                    ELSE
                        COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                        COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0)
                END as normal_balance
            FROM accounting_accounts a
            LEFT JOIN accounting_journal j ON (a.id = j.debit_account_id OR a.id = j.credit_account_id)
            WHERE a.is_active = true
            AND j.journal_date <= $1
            GROUP BY a.id, a.account_code, a.account_name, a.account_type
            HAVING COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) != 0
               OR COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) != 0
            ORDER BY a.account_code
        `, { bind: [asOfDate] });
        // 計算總借貸
        const totalDebit = trialBalance.reduce((sum, item) => sum + parseFloat(item.total_debit), 0);
        const totalCredit = trialBalance.reduce((sum, item) => sum + parseFloat(item.total_credit), 0);
        res.json({
            asOfDate,
            trialBalance,
            totals: {
                totalDebit,
                totalCredit,
                difference: totalDebit - totalCredit,
                isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
            }
        });
    }
    catch (error) {
        console.error('取得科目餘額表時發生錯誤:', error);
        res.status(500).json({ error: '取得科目餘額表失敗' });
    }
});
exports.default = router;
