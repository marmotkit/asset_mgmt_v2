import express from 'express';
import sequelize from './db/connection';
import Fee from './models/Fee';
console.log('=== 這是 asset-mgmt-fee-minimal/index.ts ===');
const app = express();
app.use(express.json());

app.get('/fees', async (req, res) => {
    console.log('收到 GET /fees 請求');
    try {
        const fees = await Fee.findAll();
        res.json(fees);
    } catch (err) {
        const error = err as Error;
        console.error('查詢 fees 發生錯誤:', error);
        res.status(500).json({
            message: error.message,
            stack: error.stack,
            error
        });
    }
});

app.post('/fees', async (req, res) => {
    try {
        const fee = await Fee.create(req.body);
        res.status(201).json(fee);
    } catch (err) {
        const error = err as Error;
        res.status(500).json({
            message: error.message,
            stack: error.stack,
            error
        });
    }
});

sequelize.authenticate()
    .then(() => console.log('資料庫連線成功'))
    .catch(err => console.error('資料庫連線失敗:', err));

sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server started');
    });
});