const fs = require('fs');
const path = require('path');

console.log('===== 修復部署問題 =====');

// 1. 檢查並修復 package.json
console.log('檢查 package.json...');
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// 確保 webpack-cli 在 devDependencies 中
if (packageJson.dependencies && packageJson.dependencies['webpack-cli']) {
    console.log('將 webpack-cli 從 dependencies 移到 devDependencies...');
    packageJson.devDependencies['webpack-cli'] = packageJson.dependencies['webpack-cli'];
    delete packageJson.dependencies['webpack-cli'];
}

// 確保使用 bcryptjs 而不是 bcrypt
if (packageJson.dependencies && packageJson.dependencies['bcrypt']) {
    console.log('將 bcrypt 替換為 bcryptjs...');
    packageJson.dependencies['bcryptjs'] = '^2.4.3';
    delete packageJson.dependencies['bcrypt'];
}

if (packageJson.devDependencies && packageJson.devDependencies['@types/bcrypt']) {
    console.log('將 @types/bcrypt 替換為 @types/bcryptjs...');
    packageJson.devDependencies['@types/bcryptjs'] = '^2.4.6';
    delete packageJson.devDependencies['@types/bcrypt'];
}

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log('✅ package.json 已更新');

// 2. 檢查並修復 .gitignore
console.log('檢查 .gitignore...');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

if (gitignoreContent.includes('package-lock.json')) {
    console.log('從 .gitignore 中移除 package-lock.json...');
    gitignoreContent = gitignoreContent.replace(/package-lock\.json\n?/g, '');
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ .gitignore 已更新');
}

// 3. 創建 .nvmrc 文件指定 Node.js 版本
console.log('創建 .nvmrc 文件...');
const nvmrcPath = path.join(__dirname, '..', '.nvmrc');
fs.writeFileSync(nvmrcPath, '18.20.2');
console.log('✅ .nvmrc 已創建');

// 4. 檢查並修復 TypeScript 文件中的 bcrypt 引用
console.log('檢查 TypeScript 文件中的 bcrypt 引用...');
const srcPath = path.join(__dirname, '..', 'src');

function updateBcryptImports(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            updateBcryptImports(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;

            // 替換 import 語句
            if (content.includes("import bcrypt from 'bcrypt'")) {
                content = content.replace("import bcrypt from 'bcrypt'", "import bcrypt from 'bcryptjs'");
                updated = true;
            }

            if (content.includes("const bcrypt = require('bcrypt')")) {
                content = content.replace("const bcrypt = require('bcrypt')", "const bcrypt = require('bcryptjs')");
                updated = true;
            }

            if (updated) {
                fs.writeFileSync(filePath, content);
                console.log(`✅ 已更新 ${filePath}`);
            }
        }
    });
}

updateBcryptImports(srcPath);

// 5. 檢查並修復腳本文件
console.log('檢查腳本文件...');
const scriptsPath = path.join(__dirname, '..', 'scripts');
if (fs.existsSync(scriptsPath)) {
    updateBcryptImports(scriptsPath);
}

console.log('===== 修復完成 =====');
console.log('');
console.log('請執行以下命令：');
console.log('1. npm install');
console.log('2. npm run build');
console.log('3. git add .');
console.log('4. git commit -m "Fix deployment issues"');
console.log('5. git push');
console.log('');
console.log('然後在 Render 後台：');
console.log('1. 清除 build cache');
console.log('2. 重新部署'); 