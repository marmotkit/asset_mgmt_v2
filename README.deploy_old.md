# 資產管理系統部署指南

本文檔詳細說明如何將資產管理系統部署到 Render 平台。

## 先決條件

1. 註冊 [Render](https://render.com) 帳號
2. 將前端和後端代碼分別推送到 GitHub 存儲庫
3. 準備好 PostgreSQL 資料庫的連接憑證

## 部署步驟

### 1. 在 Render 上部署 PostgreSQL 資料庫

1. 登入 Render 儀表板
2. 點擊 "New" > "PostgreSQL"
3. 填寫以下資訊：
   - Name: `asset-mgmt-db`
   - Database: `asset_mgmt`
   - User: 可使用默認值或自定義
   - Region: 選擇距離您用戶最近的區域
   - PostgreSQL Version: 14 或以上
4. 點擊 "Create Database"
5. 創建完成後，記錄以下資訊：
   - Internal Database URL
   - External Database URL
   - Username
   - Password

### 2. 在 Render 上部署後端 API 服務

1. 點擊 "New" > "Web Service"
2. 連接您的 GitHub 存儲庫，選擇後端 API 項目
3. 填寫以下資訊：
   - Name: `asset-mgmt-api`
   - Region: 選擇與資料庫相同的區域
   - Branch: `main` (或您的主要分支)
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. 添加環境變數：
   - `DATABASE_URL`: 使用前一步驟中記錄的 Internal Database URL
   - `JWT_SECRET`: 設置一個強密碼作為 JWT 密鑰
   - `NODE_ENV`: `production`
5. 點擊 "Create Web Service"

### 3. 在 Render 上部署前端應用

1. 點擊 "New" > "Static Site"
2. 連接您的 GitHub 存儲庫，選擇前端項目
3. 填寫以下資訊：
   - Name: `asset-mgmt-frontend`
   - Branch: `main` (或您的主要分支)
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist` (或您的前端構建輸出目錄)
4. 添加環境變數（如有需要）
5. 點擊 "Create Static Site"

### 4. 配置前端應用的 API 路徑

確保前端應用中的 API 路徑配置正確：

```typescript
// src/services/api.service.ts
private static readonly API_BASE_URL = window.location.hostname.includes('render.com')
    ? 'https://asset-mgmt-api.onrender.com/api'  // 部署後的後端 API 地址
    : 'http://localhost:3001/api';  // 本地開發環境
```

## 資料遷移

若要將本地數據遷移到 Render 的 PostgreSQL 資料庫，請遵循以下步驟：

1. 在本地導出數據：
   - 使用 `npm run export-data` 命令導出本地 localStorage 數據

2. 將數據導入到 Render 資料庫：
   - 使用 `npm run migrate` 命令執行遷移腳本

## 測試部署

1. 訪問前端應用的 URL (例如: `https://asset-mgmt-frontend.onrender.com`)
2. 測試以下功能：
   - 會員登入
   - 會員資料 CRUD
   - 投資項目管理
   - 租賃和分潤功能

## 監控和維護

Render 提供了以下監控和維護功能：

1. **日誌訪問**：在 Web Service 詳情頁面查看日誌
2. **自動部署**：當推送到 GitHub 存儲庫時自動重新部署
3. **備份**：PostgreSQL 服務提供每日自動備份
4. **擴展**：可以根據需求調整計算資源

## 故障排除

如果您遇到部署問題，請檢查：

1. 日誌以獲取錯誤信息
2. 環境變數配置
3. 資料庫連接
4. CORS 設置

## 其他資源

- [Render 文檔](https://render.com/docs)
- [PostgreSQL 文檔](https://www.postgresql.org/docs/)
- [Node.js 部署最佳實踐](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/) 