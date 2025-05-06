/**
 * 資產管理系統部署前準備腳本
 * 此腳本會檢查部署前的配置是否正確
 */

const fs = require('fs');
const path = require('path');

console.log('=== 資產管理系統部署準備檢查 ===');

// 1. 檢查 .env 文件
console.log('\n檢查環境變數配置...');
const envExample = path.join(__dirname, '../.env.example');
const envFile = path.join(__dirname, '../.env');

if (!fs.existsSync(envFile)) {
    console.error('❌ .env 文件不存在！請從 .env.example 創建一個');
    console.log('提示: 複製 .env.example 為 .env 並設置正確的值');

    // 嘗試創建 .env.example 如果不存在
    if (!fs.existsSync(envExample)) {
        console.log('創建 .env.example 範例文件...');
        const envContent = `# 資料庫配置
DATABASE_URL=postgres://postgres:postgres@localhost:5432/asset_mgmt

# JWT 配置
JWT_SECRET=your-secret-key-should-be-changed-in-production

# 服務器配置
PORT=3001
NODE_ENV=development`;
        fs.writeFileSync(envExample, envContent);
        console.log('✅ 已創建 .env.example 範例文件');
    }
} else {
    console.log('✅ .env 文件存在');

    // 檢查必要的環境變數
    const envContent = fs.readFileSync(envFile, 'utf8');
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
    const missingVars = [];

    for (const variable of requiredVars) {
        if (!envContent.includes(`${variable}=`)) {
            missingVars.push(variable);
        }
    }

    if (missingVars.length > 0) {
        console.error(`❌ .env 文件缺少以下環境變數: ${missingVars.join(', ')}`);
    } else {
        console.log('✅ 所有必要的環境變數都已設置');
    }
}

// 2. 檢查 package.json 腳本
console.log('\n檢查 package.json 腳本...');
const packageJsonPath = path.join(__dirname, '../package.json');

if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json 文件不存在！');
} else {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredScripts = ['start', 'build', 'migrate', 'export-data'];
    const missingScripts = [];

    for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
            missingScripts.push(script);
        }
    }

    if (missingScripts.length > 0) {
        console.error(`❌ package.json 缺少以下腳本: ${missingScripts.join(', ')}`);
    } else {
        console.log('✅ 所有必要的腳本都已設置');
    }

    // 檢查依賴
    const requiredDeps = ['express', 'sequelize', 'pg', 'jsonwebtoken', 'bcrypt', 'dotenv', 'cors'];
    const missingDeps = [];

    for (const dep of requiredDeps) {
        if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
            missingDeps.push(dep);
        }
    }

    if (missingDeps.length > 0) {
        console.error(`❌ package.json 缺少以下依賴: ${missingDeps.join(', ')}`);
        console.log(`提示: 執行 npm install --save ${missingDeps.join(' ')}`);
    } else {
        console.log('✅ 所有必要的依賴都已安裝');
    }
}

// 3. 檢查 Procfile
console.log('\n檢查 Procfile...');
const procfilePath = path.join(__dirname, '../Procfile');

if (!fs.existsSync(procfilePath)) {
    console.error('❌ Procfile 不存在！');
    console.log('創建 Procfile...');
    fs.writeFileSync(procfilePath, 'web: npm start');
    console.log('✅ 已創建 Procfile');
} else {
    console.log('✅ Procfile 已存在');
}

// 4. 檢查數據目錄
console.log('\n檢查 data 目錄...');
const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
    console.log('創建 data 目錄...');
    fs.mkdirSync(dataDir);
    console.log('✅ 已創建 data 目錄');
} else {
    console.log('✅ data 目錄已存在');

    // 檢查是否有數據文件
    const dataFiles = fs.readdirSync(dataDir);
    if (dataFiles.length === 0) {
        console.log('⚠️ data 目錄為空，需要執行數據導出');
        console.log('提示: 執行 npm run export-data 來導出本地數據');
    } else {
        console.log(`✅ 已找到 ${dataFiles.length} 個數據文件`);
    }
}

// 5. 提示接下來的步驟
console.log('\n=== 部署準備檢查完成 ===');
console.log('\n接下來的步驟:');
console.log('1. 確保您已經正確設置 .env 文件中的所有環境變數');
console.log('2. 確保您已經導出本地數據到 data 目錄 (npm run export-data)');
console.log('3. 確保您已經提交所有更改到 GitHub');
console.log('4. 在 Render 上按照 README.deploy.md 的說明部署應用');
console.log('\n祝您部署順利！'); 