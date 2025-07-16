# 賬務管理資料庫連接修正計劃

## 概述
將賬務管理功能從模擬資料改為真實資料庫連接，使用原生 SQL 替代 Sequelize ORM，確保資料完整性和系統效能。

## 資料表結構設計

### 1. 日記帳 (journal_entries)
```sql
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_date DATE NOT NULL,
    reference_no VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'cancelled')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_reference ON journal_entries(reference_no);
```

### 2. 日記帳明細 (journal_entry_details)
```sql
CREATE TABLE journal_entry_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_details_entry ON journal_entry_details(journal_entry_id);
CREATE INDEX idx_journal_details_account ON journal_entry_details(account_id);
```

### 3. 會計科目表 (chart_of_accounts)
```sql
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(30) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chart_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX idx_chart_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX idx_chart_accounts_parent ON chart_of_accounts(parent_account_id);
```

### 4. 應收帳款 (accounts_receivable)
```sql
CREATE TABLE accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id),
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'outstanding' CHECK (status IN ('outstanding', 'paid', 'overdue', 'written_off')),
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receivable_customer ON accounts_receivable(customer_id);
CREATE INDEX idx_receivable_status ON accounts_receivable(status);
CREATE INDEX idx_receivable_due_date ON accounts_receivable(due_date);
```

### 5. 應付帳款 (accounts_payable)
```sql
CREATE TABLE accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES users(id),
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'outstanding' CHECK (status IN ('outstanding', 'paid', 'overdue')),
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payable_supplier ON accounts_payable(supplier_id);
CREATE INDEX idx_payable_status ON accounts_payable(status);
CREATE INDEX idx_payable_due_date ON accounts_payable(due_date);
```

### 6. 月結記錄 (monthly_closings)
```sql
CREATE TABLE monthly_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    closing_month DATE NOT NULL,
    total_revenue DECIMAL(15,2) NOT NULL,
    total_expenses DECIMAL(15,2) NOT NULL,
    net_income DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'reopened')),
    closed_by UUID REFERENCES users(id),
    closed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monthly_closings_month ON monthly_closings(closing_month);
CREATE INDEX idx_monthly_closings_status ON monthly_closings(status);
```

### 7. 交易類別 (transaction_categories)
```sql
CREATE TABLE transaction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(50) NOT NULL,
    category_type VARCHAR(20) NOT NULL CHECK (category_type IN ('income', 'expense')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_categories_type ON transaction_categories(category_type);
```

## API 路由設計

### 1. 日記帳管理
- `GET /api/accounting/journal-entries` - 取得日記帳列表
- `POST /api/accounting/journal-entries` - 新增日記帳
- `GET /api/accounting/journal-entries/:id` - 取得單一日記帳
- `PUT /api/accounting/journal-entries/:id` - 更新日記帳
- `DELETE /api/accounting/journal-entries/:id` - 刪除日記帳
- `POST /api/accounting/journal-entries/:id/post` - 過帳日記帳

### 2. 會計科目管理
- `GET /api/accounting/chart-of-accounts` - 取得會計科目列表
- `POST /api/accounting/chart-of-accounts` - 新增會計科目
- `PUT /api/accounting/chart-of-accounts/:id` - 更新會計科目
- `DELETE /api/accounting/chart-of-accounts/:id` - 刪除會計科目

### 3. 應收帳款管理
- `GET /api/accounting/receivables` - 取得應收帳款列表
- `POST /api/accounting/receivables` - 新增應收帳款
- `PUT /api/accounting/receivables/:id` - 更新應收帳款
- `POST /api/accounting/receivables/:id/payment` - 記錄付款

### 4. 應付帳款管理
- `GET /api/accounting/payables` - 取得應付帳款列表
- `POST /api/accounting/payables` - 新增應付帳款
- `PUT /api/accounting/payables/:id` - 更新應付帳款
- `POST /api/accounting/payables/:id/payment` - 記錄付款

### 5. 月結管理
- `GET /api/accounting/monthly-closings` - 取得月結記錄列表
- `POST /api/accounting/monthly-closings` - 執行月結
- `GET /api/accounting/monthly-closings/:id` - 取得月結詳細資料
- `PUT /api/accounting/monthly-closings/:id/reopen` - 重新開啟月結

### 6. 財務報表
- `GET /api/accounting/reports/balance-sheet` - 資產負債表
- `GET /api/accounting/reports/income-statement` - 損益表
- `GET /api/accounting/reports/cash-flow` - 現金流量表
- `GET /api/accounting/reports/trial-balance` - 試算表

## 實現計劃

### 第一階段：基礎資料表建立
1. 建立所有資料表結構
2. 建立基礎索引
3. 插入預設會計科目資料
4. 建立交易類別資料

### 第二階段：核心 API 開發
1. 實作日記帳 CRUD API
2. 實作會計科目管理 API
3. 實作應收/應付帳款 API
4. 加入資料驗證和錯誤處理

### 第三階段：月結和報表功能
1. 實作月結邏輯
2. 開發財務報表 API
3. 實作試算表功能
4. 加入報表匯出功能

### 第四階段：前端整合
1. 更新前端 API 服務
2. 修改前端組件使用真實資料
3. 加入資料載入狀態處理
4. 實作錯誤處理和用戶提示

### 第五階段：測試和優化
1. 單元測試
2. 整合測試
3. 效能優化
4. 安全性檢查

## 技術要點

### 資料完整性
- 使用外鍵約束確保資料關聯性
- 實作檢查約束確保資料有效性
- 使用觸發器自動更新時間戳記

### 效能優化
- 建立適當的索引
- 使用分頁查詢處理大量資料
- 實作查詢快取機制

### 安全性
- 實作 API 認證和授權
- 使用參數化查詢防止 SQL 注入
- 加入資料驗證和清理

### 審計追蹤
- 記錄所有重要操作
- 維護資料修改歷史
- 實作資料備份機制

## 注意事項
1. 所有金額欄位使用 DECIMAL(15,2) 確保精確度
2. 使用 UUID 作為主鍵避免 ID 衝突
3. 實作軟刪除機制保護重要資料
4. 建立資料遷移腳本確保平滑升級 