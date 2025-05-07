"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("./models");
// 路由
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const company_routes_1 = __importDefault(require("./routes/company.routes"));
// 加載環境變量
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 中間件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 路由
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/companies', company_routes_1.default);
// 基本路由測試
app.get('/', (req, res) => {
    res.send('資產管理系統 API 服務運行中');
});
// 數據庫連接與服務器啟動
models_1.sequelize
    .authenticate()
    .then(() => {
    console.log('資料庫連接成功');
    // 同步數據庫模型
    return models_1.sequelize.sync({ alter: true });
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
