# 資產管理系統

## 專案簡介
這是一個使用 React + TypeScript 開發的資產管理系統，主要功能包括會員管理、投資組合管理等。

## 技術棧
- React 18
- TypeScript 4.9.5
- Material-UI (MUI) v5
- React Router v6
- XLSX (用於匯出 Excel)

## 開發環境需求
- Node.js >= 16.0.0
- npm >= 8.0.0
- VSCode (建議使用)

## 安裝與執行

### 安裝依賴
bash
npm install

### 開發模式執行
bash
npm start

### 建置專案
bash
npm run build

## 專案結構
src/
├── components/ # 元件
│ ├── common/ # 共用元件
│ ├── layout/ # 布局相關元件
│ └── pages/ # 頁面元件
├── contexts/ # React Context
├── services/ # 服務層
├── types/ # TypeScript 型別定義
├── utils/ # 工具函數
└── routes/ # 路由配置


## 主要功能
- 會員管理
  - 會員資料 CRUD
  - 會員匯入/匯出
  - 會員狀態管理
- 權限管理
  - 角色基礎存取控制
  - 使用者驗證
- 資料管理
  - 本地儲存
  - 資料匯出 (Excel/CSV)

## 開發規範
- 使用 TypeScript 進行開發
- 遵循 ESLint 規則
- 使用 Prettier 進行程式碼格式化
- 使用 Git Flow 工作流程

## 版本歷程
- v1.6: 修正會員管理功能問題並加入持久化儲存
- v1.5: 完成會員管理模擬 API 功能
- v1.4: 完成會員管理功能的模擬資料實作
- v1.3: 完成基礎架構和登入功能
- v1.2: 加入 Material-UI 元件
- v1.1: 專案初始化

## VSCode 建議設定
json
{
"typescript.tsdk": "node_modules\\typescript\\lib",
"editor.formatOnSave": true,
"editor.codeActionsOnSave": {
"source.fixAll.eslint": "explicit"
}
}

## 注意事項
- 目前使用本地儲存 (localStorage) 模擬後端功能
- 預設管理員帳號：admin / 密碼：admin123
- 建議使用 Chrome 最新版本瀏覽器

## 待完成功能
- [ ] 批次操作功能
- [ ] 進階搜尋功能
- [ ] 資料備份功能
- [ ] 系統設定功能
- [ ] API 整合

## 貢獻指南
1. Fork 專案
2. 建立功能分支
3. 提交變更
4. 發送 Pull Request

## 授權
KT License


