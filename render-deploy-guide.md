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
6. **重要**: 等待資料庫服務完全初始化並運行，這可能需要幾分鐘時間

### 2. 部署後端 API 服務

1. 在 Render 儀表板點擊 **New +** > **Web Service**
2. 連接 GitHub 存儲庫
3. 填寫以下資訊：
   - **Name**: `asset-mgmt-api`
   - **Environment**: `Node`
   - **Region**: 選擇與數據庫**相同**的區域 (非常重要!)
   - **Branch**: `main` (或您的主分支)
   - **Build Command**: `cd dist && npm install`
   - **Start Command**: `node dist/index.js`
4. 設置環境變數：
   - `DATABASE_URL`: 使用步驟 1 中的 **Internal Database URL** (完全複製，不要修改)
   - `JWT_SECRET`: 一個隨機的安全字符串，例如 `asset_mgmt_jwt_secret_key_2025`
   - `JWT_EXPIRES_IN`: `24h`
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
5. 點擊 **Advanced** > **Auto-Deploy**: 選擇 **Yes**
6. **重要設置**: 在 **Advanced** 設置中，找到 **Network** 部分:
   - 確保選擇 **Private Service** 並將其添加到與 PostgreSQL 數據庫相同的網絡組
   - 或者確保在 **Outbound** 部分允許訪問 PostgreSQL 服務
7. 點擊 **Create Web Service**

### 3. 確保數據庫連接

Render 的數據庫服務和 Web 服務之間需要正確連接：

1. **等待服務啟動**: 第一次部署後，等待 5-10 分鐘讓所有服務完全啟動
2. **檢查數據庫 URL**:
   - 複製 PostgreSQL 服務的 **Internal Database URL**
   - 進入 Web 服務的環境變數設置
   - 確保 `DATABASE_URL` 環境變數完全匹配複製的 URL (應該以 `postgres://` 開頭)
3. **檢查服務網絡**:
   - 在 Render 儀表板中，檢查兩個服務是否在同一網絡或區域
   - 確保 Web 服務有權訪問數據庫服務
4. **手動重啟服務**: 如果所有設置都正確但仍無法連接，嘗試手動重啟 Web 服務

### 4. 部署前端靜態站點

1. 在 Render 儀表板點擊 **New +** > **Static Site**
2. 連接您的 GitHub 存儲庫
3. 填寫以下資訊：
   - **Name**: `asset-mgmt-frontend`
   - **Branch**: `main` (或您的主分支)
   - **Build Command**: `npm install --save-dev webpack-cli && npm run build:frontend`
   - **Publish Directory**: `build`（或您的前端構建輸出目錄）
4. 設置環境變數：
   - `REACT_APP_API_URL`: 指向您的後端 API 服務的 URL（例如：`https://asset-mgmt-api.onrender.com`）
   - `NODE_VERSION`: `16`（如果遇到構建問題，嘗試指定較低的 Node.js 版本）
5. 點擊 **Create Static Site**

### 5. 數據導入和遷移

完成後端 API 部署後，連接到 Render 的數據庫並導入初始數據：

1. 確保數據庫服務已完全啟動並運行
2. 通過 API 接口添加初始管理員用戶（使用註冊端點）
3. 如果需要批量導入數據，可以通過 API 進行或直接連接到數據庫

### 6. 測試部署

1. 訪問前端應用 URL（例如：`https://asset-mgmt-frontend.onrender.com`）
2. 測試登入功能和其他關鍵功能
3. 確保 API 調用正常工作

### 7. 注意事項

1. Render 免費計劃在 15 分鐘不活動後會自動休眠服務，首次訪問可能需要等待片刻
2. 確保在生產環境中使用強密碼和安全的 JWT 密鑰
3. 定期備份數據庫數據
4. 從免費計劃升級到付費計劃可以獲得更好的性能和更多功能

## 故障排除

如果您在部署過程中遇到問題：

1. **無法連接到數據庫**:
   - 檢查 DATABASE_URL 是否正確
   - 確保 PostgreSQL 服務已完全啟動 (初始化可能需要 5-10 分鐘)
   - 確認 SSL 設置正確
   - 確保兩個服務在相同區域或私有網絡
   - 嘗試重新部署 Web 服務

2. **找不到模塊**:
   - 確保構建命令正確安裝所有依賴
   - 檢查 package.json 中是否包含所有必要的依賴

3. **前端構建失敗**:
   - 檢查構建日誌中的具體錯誤
   - 使用 `npm run build:frontend` 腳本，它會自動安裝所需依賴
   - 嘗試指定較低的 Node.js 版本 (如 14 或 16)
   - 考慮在本地構建並將構建文件夾上傳到 Render

4. **前端無法連接到後端**:
   - 確認 CORS 設置正確
   - 確認前端 API URL 配置正確指向後端服務

5. **其他常見問題**:
   - 檢查 Render 日誌中的錯誤信息
   - 確保環境變數正確設置
   - 嘗試重新部署服務

## 更新應用

1. 將更新後的代碼推送到 GitHub 存儲庫
2. Render 將自動檢測更改並重新部署服務 