import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './db/connection';

// 初始化模型
import './models';

// 路由
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';
import investmentRoutes from './routes/investment.routes';
import feeRoutes from './routes/fee.routes';

// 加載環境變量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/fees', feeRoutes);

// 基本路由測試
app.get('/', (req, res) => {
    res.send('資產管理系統 API 服務運行中');
});

// 僅驗證資料庫連線，不做自動同步
sequelize.authenticate()
    .then(() => {
        console.log('資料庫連接成功');
        app.listen(PORT, () => {
            console.log(`服務器運行在 port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('資料庫連接錯誤:', error);
    }); 