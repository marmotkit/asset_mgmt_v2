# 資產管理系統 Render 部署指南

## 前置準備

1. 註冊 [Render](https://render.com) 帳號
2. 確保您已經將代碼推送到 GitHub 存儲庫
3. 確保您已經完成本地開發和測試

## 部署步驟

### 1. 部署 PostgreSQL 數據庫

1. 登入 Render 儀表板
2. 點擊 **New +** > **PostgreSQL**
3. 填寫以下資訊：
   - **Name**: `asset-mgmt-db`
   - **Database**: `asset_mgmt`
   - **User**: 保持默認或自定義
   - **Region**: 選擇離您最近的區域
   - **PostgreSQL Version**: 14 或更高
   - **Instance Type**: 根據需求選擇適合的方案（開發可選 Free）
4. 點擊 **Create Database**
5. 創建後記錄下以下資訊：
   - **Internal Database URL**
   - **External Database URL**
   - **Username**
   - **Password**

### 2. 部署後端 API 服務

1. 在 Render 儀表板點擊 **New +** > **Web Service**
2. 連接 GitHub 存儲庫
3. 填寫以下資訊：
   - **Name**: `asset-mgmt-api`
   - **Environment**: `Node`
   - **Region**: 選擇與數據庫相同的區域
   - **Branch**: `main` (或您的主分支)
   - **Build Command**: `cd dist && npm install`
   - **Start Command**: `node dist/index.js`
4. 設置環境變數：
   - `DATABASE_URL`: 使用步驟 1 中的 Internal Database URL
   - `JWT_SECRET`: 一個隨機的安全字符串，例如 `asset_mgmt_jwt_secret_key_2025`
   - `JWT_EXPIRES_IN`: `24h`
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
5. 點擊 **Advanced** > **Auto-Deploy**: 選擇 **Yes**
6. 點擊 **Create Web Service**

### 3. 部署前端靜態站點

1. 在 Render 儀表板點擊 **New +** > **Static Site**
2. 連接您的 GitHub 存儲庫
3. 填寫以下資訊：
   - **Name**: `asset-mgmt-frontend`
   - **Branch**: `main` (或您的主分支)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`（或您的前端構建輸出目錄）
4. 設置環境變數（如需要）
5. 點擊 **Create Static Site**

### 4. 數據導入和遷移

完成後端 API 部署後，連接到 Render 的數據庫並導入初始數據：

1. 使用 `.env` 文件配置 Render 的數據庫連接
2. 運行 `npm run migrate` 命令進行數據遷移
3. 通過 API 接口添加初始管理員用戶

### 5. 測試部署

1. 訪問前端應用 URL（例如：`https://asset-mgmt-frontend.onrender.com`）
2. 測試登入功能和其他關鍵功能
3. 確保 API 調用正常工作

### 6. 注意事項

1. Render 免費計劃在 15 分鐘不活動後會自動休眠服務，首次訪問可能需要等待片刻
2. 確保在生產環境中使用強密碼和安全的 JWT 密鑰
3. 定期備份數據庫數據

## 故障排除

如果您在部署過程中遇到問題：

1. 檢查 Render 日誌中的錯誤信息
2. 確保環境變數正確設置
3. 驗證數據庫連接字符串
4. 檢查前端 API 配置是否正確指向後端服務

## 更新應用

1. 將更新後的代碼推送到 GitHub 存儲庫
2. Render 將自動檢測更改並重新部署服務 