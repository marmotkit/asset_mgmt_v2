const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== 資產管理系統部署構建 ===');

// 創建臨時的 tsconfig.json 文件
const tempTsConfigPath = path.join(__dirname, '../tsconfig.deploy.json');
const tsConfig = {
    "compilerOptions": {
        "target": "ES2018",
        "module": "commonjs",
        "outDir": "./dist",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "noImplicitAny": false
    },
    "include": [
        "src/db/**/*",
        "src/middlewares/**/*",
        "src/models/**/*",
        "src/routes/**/*",
        "src/controllers/**/*",
        "src/index.ts"
    ],
    "exclude": [
        "src/components/**/*",
        "src/pages/**/*",
        "src/services/**/*",
        "src/contexts/**/*",
        "src/layouts/**/*"
    ]
};

// 寫入臨時配置文件
fs.writeFileSync(tempTsConfigPath, JSON.stringify(tsConfig, null, 2));

console.log('✅ 已創建臨時 TypeScript 構建配置');

// 執行編譯
console.log('📦 開始編譯後端代碼...');
exec(`npx tsc -p ${tempTsConfigPath}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ 編譯錯誤: ${error.message}`);
        console.error(stderr);
        return;
    }

    console.log(stdout);
    console.log('✅ 後端代碼編譯完成');

    // 編譯後清理臨時文件
    fs.unlinkSync(tempTsConfigPath);
    console.log('✅ 已移除臨時配置文件');
}); 