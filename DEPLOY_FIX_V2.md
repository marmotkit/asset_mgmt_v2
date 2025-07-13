# 部署問題修復指南 V2

## 問題總結

1. **API 部署錯誤**: `bcrypt` 模組的 native binding 問題
2. **前端部署錯誤**: 缺少 `webpack-cli` 和 Node.js 版本問題

## 已修復的問題

### 1. bcrypt 問題
- ✅ 將 `bcrypt` 替換為 `bcryptjs`（純 JavaScript 實現，無 native binding）
- ✅ 更新所有相關的 import 語句
- ✅ 更新 TypeScript 類型定義

### 2. webpack-cli 問題
- ✅ 將 `webpack-cli` 從 `dependencies` 移到 `devDependencies`
- ✅ 更新 `fix-build.js` 自動檢查和安裝 `webpack-cli`

### 3. Node.js 版本問題
- ✅ 創建 `.nvmrc` 文件指定 Node.js 版本為 `18.20.2`
- ✅ 從 `.gitignore` 中移除 `package-lock.json`

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
- 前端服務應該能正常構建，不再出現 `webpack-cli` 錯誤

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
NODE_VERSION=18.20.2
CI=true
```

## 構建命令

### API 服務
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/index.js`

### 前端服務
- **Build Command**: `npm run build:frontend`
- **Publish Directory**: `build`

## 故障排除

### 如果 API 仍然失敗
1. 檢查 Render 日誌中的具體錯誤
2. 確認 `DATABASE_URL` 環境變數正確
3. 確認 PostgreSQL 服務正在運行
4. 嘗試手動重啟 API 服務

### 如果前端仍然失敗
1. 檢查構建日誌中的具體錯誤
2. 確認 `NODE_VERSION` 環境變數設為 `18.20.2`
3. 確認 `CI=true` 環境變數已設定
4. 嘗試清除 Render build cache 後重新部署

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