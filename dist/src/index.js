const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

// 加載環境變量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/companies', require('./routes/company.routes'));

// 基本路由測試
app.get('/', (req, res) => {
    res.send('資產管理系統 API 服務運行中');
});

// 數據庫連接與服務器啟動
sequelize
    .authenticate()
    .then(() => {
        console.log('資料庫連接成功');

        // 同步數據庫模型
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('資料庫模型同步完成');

        // 啟動服務器
        app.listen(PORT, () => {
            console.log(`服務器運行在 http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('資料庫連接錯誤:', error);
    }); 