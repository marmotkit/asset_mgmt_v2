# 資產管理系統 V6.3

## 系統概述
這是一個基於 React + TypeScript 的資產管理系統，提供會員管理、會費管理、投資管理、發票管理等功能。

## 主要功能

### 1. 會員管理
- 會員資料管理
- 會員類型設定
- 會員狀態追蹤

### 2. 會費管理
- 會費設定管理
- 會費收取記錄
- 會費歷史查詢
- 會費匯出功能
- **發票/收據管理** ✨ 新增

### 3. 投資管理
- 投資項目管理
- 租金管理
- 利潤分配
- 投資歷史記錄

### 4. 公司管理
- 公司資料管理
- 公司類型分類

### 5. 會計管理
- 應收帳款管理
- 應付帳款管理
- 財務報表
- 月結管理

### 6. 會員服務
- 年度活動管理
- 活動報名管理
- 會員關懷記錄
- 風險管理

## 技術架構

### 前端
- **React 18** + **TypeScript**
- **Material-UI (MUI)** 組件庫
- **React Router** 路由管理
- **Axios** HTTP 客戶端
- **Notistack** 通知管理

### 後端
- **Node.js** + **Express**
- **PostgreSQL** 資料庫
- **Sequelize** ORM
- **JWT** 身份驗證
- **Render** 雲端部署

## 部署資訊

### 前端部署
- **URL**: https://asset-mgmt-v2.onrender.com
- **平台**: Render
- **分支**: main

### 後端 API
- **URL**: https://asset-mgmt-api-clean.onrender.com/api
- **平台**: Render
- **分支**: main

### 資料庫
- **類型**: PostgreSQL
- **平台**: Render
- **連線**: 雲端 PostgreSQL 服務

## 最新更新 (V6.3)

### 公司管理與會員連結系統 ✨
- **完整公司管理功能**: 建立完整的公司 CRUD 管理系統
- **會員公司關聯**: 實現會員與公司的關聯管理
- **修正會員管理**: 將會員管理從 localStorage 改為連接後端 API
- **新增重設密碼功能**: 管理員可重設會員密碼

### 主要新增功能
1. **公司管理系統**:
   - 公司資料 CRUD 操作
   - 公司類型分類管理
   - 聯絡人資訊管理
   - 公司狀態追蹤

2. **會員公司關聯**:
   - 會員可設定所屬公司
   - 公司下拉選單整合
   - 會員資料與公司關聯顯示

3. **會員管理重構**:
   - 新增 `userService.ts` 連接後端 API
   - 修正會員更新和創建邏輯
   - 新增重設密碼 API 端點

### 技術改進
- 統一 API 服務架構
- 改善資料一致性和同步
- 加強錯誤處理和用戶體驗
- 完善資料驗證機制

## 歷史更新

### V6.2 - 會費報表日期格式修正
- 修正會費報表繳費日期格式為台灣地區格式 (YYYY/MM/DD)
- 同步修正發票列表日期格式
- 確保所有日期顯示一致性

### V6.1 - 發票管理系統修正
- **修正資料庫連結**: 將發票管理系統從 localStorage 改為連接雲端資料庫
- **新增 Documents API**: 建立完整的發票/收據 CRUD API 端點
- **修正會員選擇邏輯**: 正確顯示有已收款記錄的會員
- **改善資料一致性**: 確保發票資料與雲端資料庫同步

## 安裝與運行

### 環境需求
- Node.js 18+
- npm 或 yarn
- PostgreSQL 資料庫

### 本地開發
```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm start

# 建置生產版本
npm run build
```

### 環境變數設定
建立 `.env` 檔案：
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
PORT=3001
```

## API 文檔

### 認證
所有 API 請求需要包含 JWT token：
```
Authorization: Bearer <your-jwt-token>
```

### 主要端點
- `POST /api/auth/login` - 用戶登入
- `GET /api/users` - 獲取會員列表
- `GET /api/fees` - 獲取會費記錄
- `GET /api/documents` - 獲取發票/收據列表 ✨ 新增
- `POST /api/documents` - 創建發票/收據 ✨ 新增

## 開發指南

### 程式碼結構
```
src/
├── components/          # React 組件
│   ├── common/         # 通用組件
│   ├── layout/         # 佈局組件
│   └── pages/          # 頁面組件
├── services/           # API 服務
├── types/              # TypeScript 類型定義
├── utils/              # 工具函數
└── routes/             # 路由配置
```

### 新增功能流程
1. 建立 TypeScript 類型定義
2. 實作 API 服務
3. 建立 React 組件
4. 加入路由配置
5. 測試功能

## 問題回報
如有問題或建議，請透過以下方式聯繫：
- 建立 GitHub Issue
- 發送 Pull Request

## 授權
本專案採用 MIT 授權條款。


