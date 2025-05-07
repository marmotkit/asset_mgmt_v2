會員服務模塊遷移至 PostgreSQL 實施計劃
一、前期準備工作
1. 模型定義
    . 建立 AnnualActivity、ActivityRegistration 和 MemberCare 三個 Sequelize 模型
    . 根據現有的 TypeScript 型別定義建立欄位和關聯
   .  添加約束條件和索引以優化查詢效能
2. 數據庫遷移文件
    . 創建 migrations 文件，定義表格結構
    . 設置外鍵關係，建立與會員表的關聯
    . 添加適當的索引來提升查詢效能
3. 環境配置
    . 確認 connection.ts 中的連接設置
    . 在模型中添加必要的關聯配置
    . 更新 models/index.ts 導出新模型

二、遷移腳本實現
1. 資料讀取階段
   // 1. 從 localStorage 讀取現有數據
   function extractLocalStorageData() {
     const activities = JSON.parse(localStorage.getItem('annual_activities') || '[]');
     const registrations = JSON.parse(localStorage.getItem('activity_registrations') || '[]');
     const memberCares = JSON.parse(localStorage.getItem('member_cares') || '[]');
     
     return { activities, registrations, memberCares };
   }

2.  資料驗證階段
    // 2. 驗證數據完整性並處理可能的錯誤
   function validateData(data) {
     // 驗證每個活動的必填字段
     const validActivities = data.activities.filter(activity => {
       return activity.id && activity.title && activity.startDate;
     });
     
     // 類似驗證報名和關懷數據...
     
     return { validActivities, validRegistrations, validMemberCares };
   }

3. 資料遷移階段
   // 3. 將數據寫入 PostgreSQL 數據庫
   async function migrateToDatabase(validatedData) {
     try {
       // 開啟事務以確保數據一致性
       const t = await sequelize.transaction();
       
       try {
         // 寫入活動數據
         for (const activity of validatedData.validActivities) {
           await AnnualActivity.create(activity, { transaction: t });
         }
         
         // 寫入報名和關懷數據...
         
         // 提交事務
         await t.commit();
         return { success: true };
       } catch (error) {
         // 發生錯誤時回滾事務
         await t.rollback();
         throw error;
       }
     } catch (error) {
       return { success: false, error: error.message };
     }
   }

4. 遷移後驗證階段
   // 4. 驗證遷移結果
   async function verifyMigration() {
     const dbActivities = await AnnualActivity.findAll();
     const localActivities = JSON.parse(localStorage.getItem('annual_activities') || '[]');
     
     // 比較數據量是否一致
     if (dbActivities.length !== localActivities.length) {
       return { success: false, reason: '數據量不一致' };
     }
     
     // 更詳細的數據比對...
     return { success: true };
   }

三、API 服務更新
1. 更新 memberServiceAPI.ts
    . 修改所有存取方法使用數據庫而非 localStorage
    . 保持 API 接口不變，確保前端調用不受影響
    . 添加必要的錯誤處理和日誌記錄
2. 代碼示例
   // 原 localStorage 版本
   static async getActivities(year?: number, status?: ActivityStatus): Promise<AnnualActivity[]> {
     this.loadActivitiesFromStorage();
     let filtered = [...this.activities];
     // 過濾邏輯...
     return Promise.resolve(filtered);
   }
   
   // 新 PostgreSQL 版本
   static async getActivities(year?: number, status?: ActivityStatus): Promise<AnnualActivity[]> {
     try {
       const where: any = {};
       if (year) where.year = year;
       if (status) where.status = status;
       
       const activities = await AnnualActivity.findAll({ where });
       return activities;
     } catch (error) {
       console.error('獲取活動數據時發生錯誤:', error);
       throw new Error('資料庫查詢失敗');
     }
   }

四、遷移執行步驟
1. 安全備份階段
    . 在執行任何遷移前，備份所有現有的 localStorage 資料
    . 導出為 JSON 文件保存在安全位置
2. 開發環境測試
    . 先在開發環境執行遷移腳本
    . 使用測試資料驗證功能正確性
    . 解決可能出現的問題
3. 生產環境遷移
    . 在低峰時段執行遷移
    . 提供回滾機制，以便遷移失敗時快速恢復
    . 設置遷移狀態監控
4. 切換和驗證
    . 完成遷移後，切換到新的 API 實現
    . 全面測試所有會員服務功能
    . 監控系統性能和穩定性

五、風險評估與緩解措施
1. 數據丟失風險
    . 緩解：多重備份、事務處理、遷移前後數據校驗
2. 性能影響
    . 緩解：添加適當索引、優化查詢、數據庫連接池設置
3. 前端兼容性
    . 緩解：保持 API 接口不變，只修改內部實現
4. 遷移時間過長
    . 緩解：分批處理數據、使用批量插入、設置合理的超時時間

六、時間預估
1. 模型定義和遷移文件創建：1-2 天
2. 遷移腳本開發和測試：2-3 天
3. API 服務更新：2-3 天
4. 測試和問題修復：2-3 天
5. 生產環境遷移：1 天
總計：8-12 個工作日

七、後續工作
1. 在完成遷移後，考慮添加以下功能：
    . 數據庫備份機制
    . 緩存層以提高讀取性能
    . 數據審計跟踪
    . 資料訪問權限控制
2. 更新文檔以反映新的數據存儲方式

八、模型定義示例
AnnualActivity 模型
import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection';

class AnnualActivity extends Model {
  public id!: string;
  public title!: string;
  public description!: string;
  public startDate!: string;
  public endDate!: string;
  public location!: string;
  public capacity!: number;
  public registrationDeadline!: string;
  public status!: string;
  public year!: number;
  public coverImage?: string;
  public createdAt!: string;
  public updatedAt!: string;
}

AnnualActivity.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  registrationDeadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('planning', 'registration', 'ongoing', 'completed', 'cancelled'),
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'AnnualActivity',
  tableName: 'annual_activities',
  timestamps: true
});

export default AnnualActivity;

ActivityRegistration 模型和 MemberCare 模型類似定義...

九、完整遷移腳本範例
import { sequelize } from '../models';
import AnnualActivity from '../models/AnnualActivity';
import ActivityRegistration from '../models/ActivityRegistration';
import MemberCare from '../models/MemberCare';
import fs from 'fs';
import path from 'path';

async function migrateServiceData() {
  console.log('開始會員服務模塊數據遷移...');
  
  // 創建備份目錄
  const backupDir = path.join(__dirname, '../backups', `migrate_${Date.now()}`);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    // 從 localStorage 讀取數據（在服務器端需要通過其他方式獲取）
    const data = extractLocalStorageData();
    
    // 備份數據
    fs.writeFileSync(
      path.join(backupDir, 'activities_backup.json'), 
      JSON.stringify(data.activities, null, 2)
    );
    fs.writeFileSync(
      path.join(backupDir, 'registrations_backup.json'), 
      JSON.stringify(data.registrations, null, 2)
    );
    fs.writeFileSync(
      path.join(backupDir, 'member_cares_backup.json'), 
      JSON.stringify(data.memberCares, null, 2)
    );
    
    console.log('數據備份完成，開始數據驗證...');
    
    // 驗證數據
    const validatedData = validateData(data);
    console.log(`驗證結果: 有效活動 ${validatedData.validActivities.length}/${data.activities.length}`);
    
    // 遷移數據到數據庫
    console.log('開始遷移數據到數據庫...');
    const migrationResult = await migrateToDatabase(validatedData);
    
    if (migrationResult.success) {
      console.log('數據遷移成功！');
      // 可以選擇清除 localStorage 中的數據
      // clearLocalStorageData();
    } else {
      console.error('數據遷移失敗:', migrationResult.error);
    }
    
    // 驗證遷移結果
    const verificationResult = await verifyMigration();
    if (verificationResult.success) {
      console.log('遷移驗證成功！數據已正確遷移到數據庫。');
    } else {
      console.error('遷移驗證失敗:', verificationResult.reason);
    }
    
  } catch (error) {
    console.error('遷移過程中發生錯誤:', error);
  }
}

// 主函數
migrateServiceData().catch(console.error);

