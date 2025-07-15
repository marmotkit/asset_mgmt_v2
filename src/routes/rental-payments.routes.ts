import express from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../db/connection';

const router = express.Router();

// 獲取所有租金收款項目
router.get('/', async (req, res) => {
    try {
        const { investmentId, year, month } = req.query;

        let query = `
            SELECT 
                rp.*,
                i.name as investment_name,
                i.type as investment_type,
                c.name as company_name,
                u.name as user_name
            FROM rental_payments rp
            LEFT JOIN investments i ON rp."investmentId" = i.id
            LEFT JOIN companies c ON i."companyId" = c.id
            LEFT JOIN users u ON i."userId" = u.id
            ORDER BY rp.year DESC, rp.month DESC, rp."createdAt" DESC
        `;

        let replacements: any = {};
        let whereConditions: string[] = [];

        if (investmentId) {
            whereConditions.push('rp."investmentId" = :investmentId');
            replacements.investmentId = investmentId;
        }

        if (year) {
            whereConditions.push('rp.year = :year');
            replacements.year = parseInt(year as string);
        }

        if (month) {
            whereConditions.push('rp.month = :month');
            replacements.month = parseInt(month as string);
        }

        if (whereConditions.length > 0) {
            query = query.replace('ORDER BY', `WHERE ${whereConditions.join(' AND ')} ORDER BY`);
        }

        const rentalPayments = await sequelize.query(query, {
            replacements,
            type: QueryTypes.SELECT
        });

        res.json(rentalPayments);
    } catch (error) {
        console.error('獲取租金收款項目失敗:', error);
        res.status(500).json({ error: '獲取租金收款項目失敗' });
    }
});

// 獲取單個租金收款項目
router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT 
                rp.*,
                i.name as investment_name,
                i.type as investment_type,
                c.name as company_name,
                u.name as user_name
            FROM rental_payments rp
            LEFT JOIN investments i ON rp."investmentId" = i.id
            LEFT JOIN companies c ON i."companyId" = c.id
            LEFT JOIN users u ON i."userId" = u.id
            WHERE rp.id = :id
        `;

        const rentalPayments = await sequelize.query(query, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        if (rentalPayments.length === 0) {
            return res.status(404).json({ error: '租金收款項目不存在' });
        }

        res.json(rentalPayments[0]);
    } catch (error) {
        console.error('獲取租金收款項目失敗:', error);
        res.status(500).json({ error: '獲取租金收款項目失敗' });
    }
});

// 創建租金收款項目
router.post('/', async (req, res) => {
    try {
        const {
            investmentId,
            year,
            month,
            amount,
            status,
            startDate,
            endDate,
            renterName,
            renterTaxId,
            payerName,
            paymentMethod,
            paymentDate,
            note
        } = req.body;

        // 處理日期欄位，空字串設為 NULL
        const processedStartDate = startDate && startDate.trim() !== '' ? startDate : null;
        const processedEndDate = endDate && endDate.trim() !== '' ? endDate : null;
        const processedPaymentDate = paymentDate && paymentDate.trim() !== '' ? paymentDate : null;

        const query = `
            INSERT INTO rental_payments (
                id, "investmentId", year, month, amount, status, "startDate", "endDate",
                "renterName", "renterTaxId", "payerName", "paymentMethod", "paymentDate", note,
                "createdAt", "updatedAt"
            ) VALUES (
                gen_random_uuid(), :investmentId, :year, :month, :amount, :status, :startDate, :endDate,
                :renterName, :renterTaxId, :payerName, :paymentMethod, :paymentDate, :note,
                NOW(), NOW()
            ) RETURNING *
        `;

        const result = await sequelize.query(query, {
            replacements: {
                investmentId,
                year,
                month,
                amount,
                status,
                startDate: processedStartDate,
                endDate: processedEndDate,
                renterName,
                renterTaxId,
                payerName,
                paymentMethod,
                paymentDate: processedPaymentDate,
                note
            },
            type: QueryTypes.INSERT
        });

        // 直接返回插入的結果
        const insertedRentalPayment = result[0] as any;

        if (insertedRentalPayment && insertedRentalPayment.id) {
            const newRentalPayment = await sequelize.query(`
                SELECT 
                    rp.*,
                    i.name as investment_name,
                    i.type as investment_type,
                    c.name as company_name,
                    u.name as user_name
                FROM rental_payments rp
                LEFT JOIN investments i ON rp."investmentId" = i.id
                LEFT JOIN companies c ON i."companyId" = c.id
                LEFT JOIN users u ON i."userId" = u.id
                WHERE rp.id = :id
            `, {
                replacements: { id: insertedRentalPayment.id },
                type: QueryTypes.SELECT
            });

            res.status(201).json(newRentalPayment[0]);
        } else {
            // 如果沒有返回 ID，直接返回插入的資料
            res.status(201).json(insertedRentalPayment);
        }
    } catch (error) {
        console.error('創建租金收款項目失敗:', error);
        res.status(400).json({ error: '創建租金收款項目失敗' });
    }
});

// 更新租金收款項目
router.put('/:id', async (req, res) => {
    try {
        // 檢查租金收款項目是否存在
        const checkQuery = 'SELECT id FROM rental_payments WHERE id = :id';
        const existing = await sequelize.query(checkQuery, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        if (existing.length === 0) {
            return res.status(404).json({ error: '租金收款項目不存在' });
        }

        const {
            investmentId,
            year,
            month,
            amount,
            status,
            startDate,
            endDate,
            renterName,
            renterTaxId,
            payerName,
            paymentMethod,
            paymentDate,
            note
        } = req.body;

        // 處理日期欄位，空字串設為 NULL
        const processedStartDate = startDate && startDate.trim() !== '' ? startDate : null;
        const processedEndDate = endDate && endDate.trim() !== '' ? endDate : null;
        const processedPaymentDate = paymentDate && paymentDate.trim() !== '' ? paymentDate : null;

        const updateQuery = `
            UPDATE rental_payments SET
                "investmentId" = :investmentId,
                year = :year,
                month = :month,
                amount = :amount,
                status = :status,
                "startDate" = :startDate,
                "endDate" = :endDate,
                "renterName" = :renterName,
                "renterTaxId" = :renterTaxId,
                "payerName" = :payerName,
                "paymentMethod" = :paymentMethod,
                "paymentDate" = :paymentDate,
                note = :note,
                "updatedAt" = NOW()
            WHERE id = :id
        `;

        await sequelize.query(updateQuery, {
            replacements: {
                id: req.params.id,
                investmentId,
                year,
                month,
                amount,
                status,
                startDate: processedStartDate,
                endDate: processedEndDate,
                renterName,
                renterTaxId,
                payerName,
                paymentMethod,
                paymentDate: processedPaymentDate,
                note
            },
            type: QueryTypes.UPDATE
        });

        // 獲取更新後的租金收款項目
        const updatedRentalPayment = await sequelize.query(`
            SELECT 
                rp.*,
                i.name as investment_name,
                i.type as investment_type,
                c.name as company_name,
                u.name as user_name
            FROM rental_payments rp
            LEFT JOIN investments i ON rp."investmentId" = i.id
            LEFT JOIN companies c ON i."companyId" = c.id
            LEFT JOIN users u ON i."userId" = u.id
            WHERE rp.id = :id
        `, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        res.json(updatedRentalPayment[0]);
    } catch (error) {
        console.error('更新租金收款項目失敗:', error);
        res.status(400).json({ error: '更新租金收款項目失敗' });
    }
});

// 刪除租金收款項目
router.delete('/:id', async (req, res) => {
    try {
        // 檢查租金收款項目是否存在
        const checkQuery = 'SELECT id FROM rental_payments WHERE id = :id';
        const existing = await sequelize.query(checkQuery, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        if (existing.length === 0) {
            return res.status(404).json({ error: '租金收款項目不存在' });
        }

        // 刪除租金收款項目
        const deleteQuery = 'DELETE FROM rental_payments WHERE id = :id';
        await sequelize.query(deleteQuery, {
            replacements: { id: req.params.id },
            type: QueryTypes.DELETE
        });

        res.status(204).send();
    } catch (error) {
        console.error('刪除租金收款項目失敗:', error);
        res.status(500).json({ error: '刪除租金收款項目失敗' });
    }
});

// 生成租金收款項目
router.post('/generate', async (req, res) => {
    try {
        const { investmentId, year } = req.body;

        // 檢查是否已存在該年度的租金收款項目
        const existingQuery = `
            SELECT COUNT(*) as count 
            FROM rental_payments 
            WHERE "investmentId" = :investmentId AND year = :year
        `;
        const existingResult = await sequelize.query(existingQuery, {
            replacements: { investmentId, year },
            type: QueryTypes.SELECT
        });

        if ((existingResult[0] as any).count > 0) {
            return res.status(400).json({ error: '該年度的租金收款項目已經存在，請勿重複生成' });
        }

        // 找到對應的租賃標準
        const standardsQuery = `
            SELECT * FROM rental_standards 
            WHERE "investmentId" = :investmentId 
            AND "startDate" IS NOT NULL 
            AND "endDate" IS NOT NULL
        `;
        const rentalStandards = await sequelize.query(standardsQuery, {
            replacements: { investmentId },
            type: QueryTypes.SELECT
        });

        if (!rentalStandards || rentalStandards.length === 0) {
            return res.status(400).json({ error: '尚未設定租賃標準' });
        }

        // 找到適用於該年度的租賃標準
        const applicableStandard = rentalStandards.find((s: any) => {
            const startDate = new Date(s.startDate);
            const endDate = new Date(s.endDate);
            const yearStart = new Date(year, 0, 1);
            const yearEnd = new Date(year, 11, 31);
            return startDate <= yearEnd && endDate >= yearStart;
        });

        if (!applicableStandard) {
            return res.status(400).json({ error: '找不到適用於該年度的租賃標準' });
        }

        if (!(applicableStandard as any).renterName) {
            return res.status(400).json({ error: '租賃標準中未設定承租人資訊' });
        }

        const standardStartDate = new Date((applicableStandard as any).startDate);
        const standardEndDate = new Date((applicableStandard as any).endDate);

        // 計算該年度需要生成的月份範圍
        let startMonth = 0;  // 預設從1月開始
        let endMonth = 11;   // 預設到12月結束

        // 如果是合約開始年份，從合約開始月份開始
        if (year === standardStartDate.getFullYear()) {
            startMonth = standardStartDate.getMonth();
        }

        // 如果是合約結束年份，要包含到結束日期所在月份
        if (year === standardEndDate.getFullYear()) {
            endMonth = standardEndDate.getMonth();
        }

        // 生成租金收款項目
        const newPayments: any[] = [];
        for (let month = startMonth; month <= endMonth; month++) {
            const paymentStartDate = new Date(year, month, 1);
            const paymentEndDate = new Date(year, month + 1, 0);

            const insertQuery = `
                INSERT INTO rental_payments (
                    id, "investmentId", year, month, amount, status, "startDate", "endDate",
                    "renterName", "renterTaxId", "payerName", "createdAt", "updatedAt"
                ) VALUES (
                    gen_random_uuid(), :investmentId, :year, :month, :amount, :status, :startDate, :endDate,
                    :renterName, :renterTaxId, :payerName, NOW(), NOW()
                )
            `;

            await sequelize.query(insertQuery, {
                replacements: {
                    investmentId,
                    year,
                    month: month + 1,
                    amount: (applicableStandard as any).monthlyRent,
                    status: 'pending',
                    startDate: paymentStartDate.toISOString().split('T')[0],
                    endDate: paymentEndDate.toISOString().split('T')[0],
                    renterName: (applicableStandard as any).renterName,
                    renterTaxId: (applicableStandard as any).renterTaxId,
                    payerName: (applicableStandard as any).renterName  // 預設繳款人同承租人
                },
                type: QueryTypes.INSERT
            });
        }

        res.status(201).json({ message: '租金收款項目生成成功' });
    } catch (error) {
        console.error('生成租金收款項目失敗:', error);
        res.status(500).json({ error: '生成租金收款項目失敗' });
    }
});

// 清除租金收款項目
router.delete('/clear/:year/:month?', async (req, res) => {
    try {
        const { year, month } = req.params;

        let deleteQuery = 'DELETE FROM rental_payments WHERE year = :year';
        let replacements: any = { year: parseInt(year) };

        if (month) {
            deleteQuery += ' AND month = :month';
            replacements.month = parseInt(month);
        }

        await sequelize.query(deleteQuery, {
            replacements,
            type: QueryTypes.DELETE
        });

        res.status(204).send();
    } catch (error) {
        console.error('清除租金收款項目失敗:', error);
        res.status(500).json({ error: '清除租金收款項目失敗' });
    }
});

export default router; 