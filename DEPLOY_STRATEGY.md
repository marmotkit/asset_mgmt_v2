# 資產管理系統雲端部署策略

## 一、部署策略總覽

1. **資料庫規劃**
   - 選用 Render 的 PostgreSQL 作為主資料庫。
   - 設計資料表，對應現有功能（會員、公司、投資、租賃、分潤、帳務等）。
   - 先建立管理者帳號與權限，其他使用者後續再擴充。

2. **後端 API 部署**
   - 修改 API 服務，將資料來源從 localStorage 改為 PostgreSQL。
   - 保持 API 路徑與前端相容，逐步替換資料來源，不影響現有功能。

3. **前端部署**
   - 前端維持現有 React + TypeScript 架構，API base URL 指向雲端 API。
   - 測試所有功能與資料串接。

4. **權限管理**
   - 先實作管理者帳號，擁有所有操作權限。
   - 其他角色（一般會員、商務會員等）後續再細分。

5. **資料遷移與測試**
   - 若有本地測試資料，可設計匯入工具或手動導入資料庫。
   - 上線前進行完整測試，確保資料正確、功能無誤。

---

## 二、資料庫（PostgreSQL）資料表設計建議

### 1. users（會員/使用者）
| 欄位           | 型別           | 說明         |
|----------------|----------------|--------------|
| id             | UUID/serial    | 主鍵         |
| member_no      | varchar        | 會員編號     |
| username       | varchar        | 登入帳號     |
| password_hash  | varchar        | 密碼雜湊     |
| name           | varchar        | 姓名         |
| email          | varchar        | Email        |
| role           | varchar        | 角色（admin, business, normal, lifetime...）|
| status         | varchar        | 狀態         |
| created_at     | timestamp      | 建立時間     |
| updated_at     | timestamp      | 更新時間     |

### 2. companies（公司）
| 欄位           | 型別           | 說明         |
|----------------|----------------|--------------|
| id             | UUID/serial    | 主鍵         |
| company_no     | varchar        | 公司編號     |
| name           | varchar        | 公司名稱     |
| address        | varchar        | 地址         |
| phone          | varchar        | 電話         |
| created_at     | timestamp      | 建立時間     |
| updated_at     | timestamp      | 更新時間     |

### 3. investments（投資項目）
| 欄位           | 型別           | 說明         |
|----------------|----------------|--------------|
| id             | UUID/serial    | 主鍵         |
| company_id     | UUID           | 關聯公司     |
| user_id        | UUID           | 關聯會員     |
| type           | varchar        | 動產/不動產  |
| name           | varchar        | 投資名稱     |
| amount         | numeric        | 金額         |
| start_date     | date           | 開始日期     |
| status         | varchar        | 狀態         |
| ...            | ...            | 其他欄位     |
| created_at     | timestamp      | 建立時間     |
| updated_at     | timestamp      | 更新時間     |

### 4. rentals（租賃）
| 欄位           | 型別           | 說明         |
|----------------|----------------|--------------|
| id             | UUID/serial    | 主鍵         |
| investment_id  | UUID           | 關聯投資     |
| monthly_rent   | numeric        | 月租金       |
| start_date     | date           | 生效日期     |
| end_date       | date           | 結束日期     |
| renter_name    | varchar        | 承租人       |
| ...            | ...            | 其他欄位     |

### 5. profit_sharing（分潤）
| 欄位           | 型別           | 說明         |
|----------------|----------------|--------------|
| id             | UUID/serial    | 主鍵         |
| investment_id  | UUID           | 關聯投資     |
| type           | varchar        | 分潤方式     |
| value          | numeric        | 分潤值       |
| start_date     | date           | 生效日期     |
| end_date       | date           | 結束日期     |
| ...            | ...            | 其他欄位     |

### 6. invoices（發票/收據）
| 欄位           | 型別           | 說明         |
|----------------|----------------|--------------|
| id             | UUID/serial    | 主鍵         |
| payment_id     | UUID           | 關聯收款     |
| type           | varchar        | 發票/收據類型|
| amount         | numeric        | 金額         |
| ...            | ...            | 其他欄位     |

### 7. payments（收款/會費/繳費）
| 欄位           | 型別           | 說明         |
|----------------|----------------|--------------|
| id             | UUID/serial    | 主鍵         |
| member_id      | UUID           | 關聯會員     |
| amount         | numeric        | 金額         |
| due_date       | date           | 到期日       |
| status         | varchar        | 狀態         |
| note           | varchar        | 備註         |
| ...            | ...            | 其他欄位     |

### 8. 其他（如偏好、歷史紀錄、帳務等）
- 可依需求再細分設計。

---

## 三、部署步驟建議

### 1. 建立資料庫
- 在 Render 後台建立 PostgreSQL 資料庫，取得連線資訊（host、user、password、db name、port）。

### 2. 設計資料表
- 依上方建議，撰寫 SQL 建立所有資料表與關聯（可用 pgAdmin、DBeaver、psql 等工具）。

### 3. 後端 API 改造
- 將原本 localStorage 的資料存取，改為連接 PostgreSQL。
- 可用 ORM（如 Sequelize、TypeORM、Prisma）或原生 SQL。
- 保持 API 路徑與資料結構不變，確保前端無痛切換。

### 4. 管理者權限
- 預設建立一組管理者帳號（role: admin），可操作所有功能。
- API 層加上權限驗證（如 JWT + 角色判斷）。

### 5. 前端設定
- 確認 API base URL 指向雲端 API。
- 測試所有功能串接。

### 6. 測試與資料遷移
- 若有本地測試資料，可設計匯入腳本或手動導入資料庫。
- 上線前完整測試所有功能。

### 7. 正式上線
- 前後端皆部署於 Render，資料集中於 PostgreSQL。
- 管理者可登入並操作所有功能。

---

## 四、後續建議

- **資料備份**：定期備份 PostgreSQL 資料庫。
- **安全性**：API 加強權限控管、資料加密、日誌紀錄。
- **多角色權限**：後續可細分一般會員、商務會員等權限。
- **監控與維運**：可加裝 Sentry、LogRocket 等監控工具。

---

## 五、部署引導步驟

1. 依據本文件，先在 Render 建立 PostgreSQL 資料庫。
2. 下載/安裝 pgAdmin 或 DBeaver，連線到資料庫，執行 SQL 建立資料表。
3. 修改後端 API 程式，將資料來源改為 PostgreSQL，並測試連線。
4. 設定管理者帳號，並測試權限功能。
5. 前端 API base URL 指向雲端 API，測試所有功能。
6. 若有本地資料，設計匯入腳本或手動導入。
7. 全部測試無誤後，正式上線。

如需範例 SQL、ORM 實作、API 權限驗證等細節，請隨時提出！ 