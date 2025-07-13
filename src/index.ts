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
import feeSettingsRoutes from './routes/fee-settings.routes';

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
app.use('/api/fee-settings', feeSettingsRoutes);

// 基本路由測試
app.get('/', (req, res) => {
    res.send('資產管理系統 API 服務運行中');
});

// 啟動時同步所有 Sequelize model，確保 model 註冊正確
sequelize.sync({ alter: false })
    .then(() => {
        console.log('資料庫同步成功');
        app.listen(PORT, () => {
            console.log(`服務器運行在 port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('資料庫同步錯誤:', error);
    }); 