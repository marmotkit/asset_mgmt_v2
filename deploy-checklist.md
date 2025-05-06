# 資產管理系統部署檢查清單

## 前期準備

- [ ] 註冊 Render 帳號
- [ ] 準備 GitHub 存儲庫
  - [ ] 前端存儲庫
  - [ ] 後端存儲庫
- [ ] 確認所有代碼已提交到 GitHub

## 部署數據庫

- [ ] 在 Render 上創建 PostgreSQL 資料庫
  - [ ] 名稱: `asset-mgmt-db`
  - [ ] 記錄連接資訊
    - [ ] Internal Database URL
    - [ ] External Database URL
    - [ ] 用户名和密碼

## 部署後端 API

- [ ] 創建 `.env` 文件（基於 `.env.example`）
  - [ ] 設置 `DATABASE_URL`
  - [ ] 設置 `JWT_SECRET`
  - [ ] 設置 `NODE_ENV=production`
- [ ] 在 Render 上創建 Web Service
  - [ ] 名稱: `asset-mgmt-api`
  - [ ] 連接 GitHub 存儲庫
  - [ ] 設置構建命令: `npm install && npm run build`
  - [ ] 設置啟動命令: `npm start`
  - [ ] 添加環境變數:
    - [ ] `DATABASE_URL`
    - [ ] `JWT_SECRET`
    - [ ] `NODE_ENV=production`
- [ ] 部署 Web Service
- [ ] 測試 API 端點 (`https://asset-mgmt-api.onrender.com/`)

## 數據遷移

- [ ] 導出本地數據
  - [ ] 運行 `npm run export-data`
  - [ ] 下載所有 JSON 文件到 `data` 目錄
- [ ] 配置 `.env` 文件指向 Render 資料庫
- [ ] 運行遷移腳本 `npm run migrate`
- [ ] 驗證數據是否成功遷移

## 部署前端應用

- [ ] 更新前端 API 配置
  ```typescript
  private static readonly API_BASE_URL = window.location.hostname.includes('render.com')
      ? 'https://asset-mgmt-api.onrender.com/api'
      : 'http://localhost:3001/api';
  ```
- [ ] 在 Render 上創建 Static Site
  - [ ] 名稱: `asset-mgmt-frontend`
  - [ ] 連接 GitHub 存儲庫
  - [ ] 設置構建命令: `npm install && npm run build`
  - [ ] 設置發布目錄: `dist`
- [ ] 部署 Static Site
- [ ] 測試前端應用 (`https://asset-mgmt-frontend.onrender.com/`)

## 測試和驗證

- [ ] 測試關鍵功能:
  - [ ] 會員登入
  - [ ] 會員資料 CRUD
  - [ ] 公司資料 CRUD
  - [ ] 投資項目管理
  - [ ] 租賃標準和收款管理
  - [ ] 分潤標準和會員分潤管理
  - [ ] 發票管理

## 維護和監控

- [ ] 設置監控
  - [ ] 檢查 Render 日誌和指標
  - [ ] 設置錯誤通知
- [ ] 準備備份策略
  - [ ] 設置定期資料庫備份
  - [ ] 下載重要資料的本地備份

## 問題排查資源

- 後端 API: `https://asset-mgmt-api.onrender.com/`
- 前端應用: `https://asset-mgmt-frontend.onrender.com/`
- 資料庫: Render Dashboard > asset-mgmt-db
- 日誌: Render Dashboard > asset-mgmt-api > Logs 