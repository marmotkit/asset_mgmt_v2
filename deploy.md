# 資產管理系統雲端部署計劃

## 系統概述

此資產管理系統是一個現代化的網頁應用程式，主要功能包括：

- 會員管理：包含會員資料管理、身份驗證等
- 公司管理：管理資產相關的公司資訊
- 投資管理：包括動產和不動產的投資項目
- 租賃管理：設定租賃標準、管理租金收款
- 分潤管理：設定分潤標準、管理會員分潤
- 發票管理：生成和管理各類發票和收據

目前系統架構特點：
- 前端：使用 React + TypeScript，使用 Material-UI 組件庫
- 資料存儲：主要使用 localStorage 進行資料持久化
- 模擬 API：系統有預留 RESTful API 接口，但目前主要是使用模擬數據

## 部署架構

我們將使用 Render 提供的服務來部署整個系統：

1. **前端應用**：使用 Render 的 Static Site 服務
2. **後端 API**：使用 Render 的 Web Service 服務
3. **資料庫**：使用 Render 的 PostgreSQL 服務

### 部署架構圖

```
            +------------------+
            |                  |
 用戶訪問 ---->  Render Static  |  (前端應用)
            |    Site 服務     |
            +--------|---------+
                     |
                     | API 請求
                     v
            +------------------+
            |                  |
            |  Render Web     |  (後端 API)
            |  Service 服務   |
            +--------|---------+
                     |
                     | 資料存取
                     v
            +------------------+
            |                  |
            |  Render Postgres |  (資料庫)
            |    資料庫服務     |
            +------------------+
```

## 部署步驟

### 1. 準備前端應用

1.1 修改 API 配置：
- 在 `src/services/api.service.ts` 中，將 API_BASE_URL 修改為指向新的後端服務：

```typescript
private static readonly API_BASE_URL = window.location.hostname.includes('render.com')
    ? 'https://您的應用名稱-api.onrender.com/api'
    : '/api';
```

1.2 移除 localStorage 模擬數據：
- 在部署到生產環境時，我們需要將系統從本地存儲轉移到真實的後端 API。這需要修改所有 `loadFromStorage` 和 `saveToStorage` 方法，使其通過 API 存取資料。

1.3 構建前端應用：
```bash
npm run build
```

### 2. 開發後端 API 服務

2.1 創建 Express 後端項目：

```bash
mkdir asset-mgmt-backend
cd asset-mgmt-backend
npm init -y
npm install express cors pg pg-hstore sequelize dotenv jsonwebtoken bcrypt
npm install -D typescript @types/express @types/cors @types/node @types/pg ts-node
```

2.2 設置 TypeScript 配置：
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

2.3 創建資料庫模型：

根據現有的資料結構，創建相應的資料庫模型：

- User 模型（會員）
- Company 模型（公司）
- Investment 模型（投資項目）
- RentalStandard 模型（租賃標準）
- ProfitSharingStandard 模型（分潤標準）
- RentalPayment 模型（租金收款）
- MemberProfit 模型（會員分潤）
- Invoice 模型（發票）

2.4 創建後端 API 路由：

根據前端已有的 API 調用，實現相應的 RESTful API 路由：

- `/api/auth/login` - 處理登入
- `/api/auth/register` - 處理註冊
- `/api/users` - 會員管理
- `/api/companies` - 公司管理
- `/api/investments` - 投資項目管理
- `/api/rental-standards` - 租賃標準設定
- `/api/profit-standards` - 分潤標準設定
- `/api/rental-payments` - 租金收款管理
- `/api/member-profits` - 會員分潤管理
- `/api/invoices` - 發票管理

2.5 創建資料庫連接配置：

```typescript
// src/db/connection.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || '';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  ssl: process.env.NODE_ENV === 'production',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

export default sequelize;
```

2.6 創建後端啟動文件：

```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import sequelize from './db/connection';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';
import investmentRoutes from './routes/investment.routes';
// ... 其他路由導入

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
// ... 其他路由

// 資料庫同步
sequelize.sync().then(() => {
  console.log('資料庫已同步');
  
  // 啟動服務器
  app.listen(PORT, () => {
    console.log(`伺服器運行在 http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('資料庫同步錯誤:', err);
});
```

### 3. 在 Render 上部署 PostgreSQL 資料庫

3.1 登入 Render 儀表板並創建新的 PostgreSQL 資料庫服務：
- 名稱：`asset-mgmt-db`
- 選擇合適的資料庫計劃
- 設置資料庫名稱、使用者和密碼

3.2 保存生成的資料庫連接 URL 和憑證。

### 4. 在 Render 上部署後端 API 服務

4.1 將後端 API 項目推送到 GitHub：
```bash
git init
git add .
git commit -m "Initial commit for backend API"
git push -u origin main
```

4.2 在 Render 儀表板創建新的 Web Service：
- 關聯 GitHub 存儲庫
- 名稱：`asset-mgmt-api`
- 構建命令：`npm install && npm run build`
- 啟動命令：`npm start`
- 添加環境變數：
  - `DATABASE_URL`：PostgreSQL 連接字串
  - `JWT_SECRET`：用於 JWT 身份驗證的密鑰
  - `NODE_ENV`：`production`

### 5. 在 Render 上部署前端應用

5.1 將前端代碼推送到另一個 GitHub 存儲庫：
```bash
git add .
git commit -m "Prepare frontend for production"
git push -u origin main
```

5.2 在 Render 儀表板創建新的 Static Site：
- 關聯 GitHub 存儲庫
- 名稱：`asset-mgmt-frontend`
- 構建命令：`npm install && npm run build`
- 發布目錄：`dist`
- 添加環境變數（如有需要）

### 6. 設置域名和 HTTPS

6.1 在 Render 中，為每個服務配置自定義域名（如有需要）
6.2 Render 自動為所有服務提供 HTTPS

## 資料遷移

從本地開發環境將現有數據遷移到生產數據庫：

1. 創建資料遷移腳本：
```typescript
// scripts/migration.ts
import fs from 'fs';
import { sequelize, User, Company, Investment, /* 其他模型 */ } from '../src/models';

async function migrateData() {
  try {
    // 從 localStorage 導出的數據文件中讀取數據
    const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
    const companies = JSON.parse(fs.readFileSync('./data/companies.json', 'utf8'));
    const investments = JSON.parse(fs.readFileSync('./data/investments.json', 'utf8'));
    // ... 讀取其他數據

    // 將數據寫入數據庫
    await User.bulkCreate(users);
    await Company.bulkCreate(companies);
    await Investment.bulkCreate(investments);
    // ... 遷移其他數據

    console.log('數據遷移完成');
    process.exit(0);
  } catch (error) {
    console.error('數據遷移錯誤:', error);
    process.exit(1);
  }
}

// 同步資料庫表結構，然後遷移數據
sequelize.sync({ force: true }).then(migrateData);
```

2. 從本地開發環境導出數據：

創建一個工具來從 localStorage 導出數據：
```html
<!-- export-data.html -->
<script>
  function exportData() {
    const data = {
      users: JSON.parse(localStorage.getItem('users') || '[]'),
      companies: JSON.parse(localStorage.getItem('companies') || '[]'),
      investments: JSON.parse(localStorage.getItem('investments') || '[]'),
      // ... 導出其他數據
    };
    
    for (const [key, value] of Object.entries(data)) {
      const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${key}.json`;
      a.click();
    }
  }
  
  // 自動執行導出
  document.addEventListener('DOMContentLoaded', exportData);
</script>
```

3. 運行遷移腳本：
```bash
npm run migrate
```

## 測試和驗證

1. 在部署後，對關鍵功能進行測試：
   - 會員登入
   - 會員資料 CRUD
   - 投資項目管理
   - 租賃收款功能
   - 分潤管理功能
   - 發票生成和管理

2. 確保資料一致性：
   - 檢查所有已遷移的數據
   - 測試新創建的數據是否正確存儲和檢索

## 監控和維護

1. 設置應用程序監控：
   - 使用 Render 提供的監控工具
   - 設置資料庫性能監控

2. 建立備份策略：
   - 定期備份 PostgreSQL 數據庫
   - 建立自動備份計劃

3. 設置日誌記錄：
   - 配置應用程序日誌記錄
   - 設置錯誤報告和通知機制

## 結論

這個部署計劃將現有的資產管理系統從使用本地存儲（localStorage）的模擬環境遷移到使用 Render 提供的全棧雲服務。透過此遷移，系統將更加穩定且可擴展，同時保留現有的所有功能和用戶體驗。

部署完成後，系統將具有以下優勢：
1. 集中式資料存儲 - 所有數據安全地存儲在 PostgreSQL 數據庫中
2. 可靠的身份驗證 - 使用 JWT 進行安全的用戶認證
3. 可擴展性 - 可以根據需求輕鬆擴展資源
4. 高可用性 - Render 提供的服務具有高可用性和自動擴展能力

此部署計劃保留了系統的所有現有功能，僅將數據存儲從前端的 localStorage 轉移到後端的 PostgreSQL 數據庫，同時確保所有 API 接口與現有前端代碼兼容。 