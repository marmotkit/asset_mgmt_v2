# 部署問題修復指南 V2

## 問題總結

1. **API 部署錯誤**: `bcrypt` 模組的 native binding 問題
2. **前端部署錯誤**: 缺少 `webpack-cli` 和 Node.js 版本問題
3. **前端構建互動式提示問題**: webpack-cli 安裝時的 yes/no 提示
4. **webpack-cli 依賴問題**: 在部署環境中 webpack-cli 仍然出現互動式提示

## 已修復的問題

### 1. bcrypt 問題
- ✅ 將 `bcrypt` 替換為 `bcryptjs`（純 JavaScript 實現，無 native binding）
- ✅ 更新所有相關的 import 語句
- ✅ 更新 TypeScript 類型定義

### 2. webpack-cli 問題
- ✅ 將 `webpack-cli` 從 `dependencies` 移到 `devDependencies`
- ✅ 創建直接使用 webpack API 的構建腳本 `scripts/webpack-build.js`
- ✅ 完全避免 webpack-cli 的依賴和互動式提示

### 3. Node.js 版本問題
- ✅ 更新 `.nvmrc` 到受支援的版本 `20.11.0`
- ✅ 從 `.gitignore` 中移除 `package-lock.json`

### 4. 非互動式構建問題
- ✅ 創建 `.npmrc` 文件設定 `yes=true` 和 `ci=true`
- ✅ 使用 webpack API 直接構建，避免 CLI 工具
- ✅ 設定環境變數 `CI=true` 和 `NODE_ENV=production`

## 部署步驟

### 1. 在 Render 後台清除快取
1. 登入 Render 儀表板
2. 進入 API 服務設定
3. 點擊 **Environment** 標籤
4. 點擊 **Clear Build Cache**
5. 對前端服務重複相同步驟

### 2. 重新部署
1. 在 API 服務頁面點擊 **Manual Deploy** > **Deploy latest commit**
2. 在前端服務頁面點擊 **Manual Deploy** > **Deploy latest commit**

### 3. 檢查部署狀態
- API 服務應該能正常啟動，不再出現 `bcrypt` 錯誤
- 前端服務應該能正常構建，不再出現 `webpack-cli` 錯誤或互動式提示

## 環境變數設定

### API 服務環境變數
```
DATABASE_URL=postgres://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
NODE_ENV=production
PORT=3000
```

### 前端服務環境變數
```
REACT_APP_API_URL=https://your-api-service.onrender.com
NODE_VERSION=20.11.0
CI=true
```

## 構建命令

### API 服務
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/index.js`

### 前端服務
- **Build Command**: `npm run build:frontend`
- **Publish Directory**: `build`

## 新增文件說明

### scripts/webpack-build.js
- 直接使用 webpack API 的構建腳本
- 完全避免 webpack-cli 依賴
- 設定非互動式環境變數
- 使用 webpack compiler.run() 方法

### .npmrc
- 設定 npm 使用非互動式模式
- `yes=true`: 自動回答 yes
- `ci=true`: 持續整合模式

### .nvmrc
- 指定 Node.js 版本為 20.11.0
- 確保使用受支援的版本

## 故障排除

### 如果 API 仍然失敗
1. 檢查 Render 日誌中的具體錯誤
2. 確認 `DATABASE_URL` 環境變數正確
3. 確認 PostgreSQL 服務正在運行
4. 嘗試手動重啟 API 服務

### 如果前端仍然失敗
1. 檢查構建日誌中的具體錯誤
2. 確認 `NODE_VERSION` 環境變數設為 `20.11.0`
3. 確認 `CI=true` 環境變數已設定
4. 嘗試清除 Render build cache 後重新部署
5. 檢查是否還有互動式提示問題
6. 確認使用新的 `scripts/webpack-build.js` 腳本

### 如果數據庫連接失敗
1. 確認 PostgreSQL 服務已完全啟動（可能需要 5-10 分鐘）
2. 檢查 `DATABASE_URL` 是否使用 Internal Database URL
3. 確認兩個服務在同一區域
4. 檢查網絡設定是否正確

## 驗證部署

1. 訪問前端應用 URL
2. 測試登入功能
3. 測試創建費用記錄功能
4. 檢查 API 調用是否正常工作

## 注意事項

- Render 免費計劃在 15 分鐘不活動後會自動休眠
- 首次訪問可能需要等待服務啟動
- 確保使用強密碼和安全的 JWT 密鑰
- 定期備份數據庫數據
- 新的構建腳本完全避免 webpack-cli 問題
- 使用 webpack API 直接構建，更穩定可靠 