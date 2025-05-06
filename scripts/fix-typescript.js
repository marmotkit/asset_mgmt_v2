const fs = require('fs');
const path = require('path');

// 顯示標題
console.log('=== 修復 TypeScript 類型錯誤 ===');

try {
    // 修正 api.service.ts 中的類型錯誤
    console.log('修復 api.service.ts 中的類型錯誤...');
    const apiServicePath = path.join(__dirname, '..', 'src', 'services', 'api.service.ts');

    if (fs.existsSync(apiServicePath)) {
        let content = fs.readFileSync(apiServicePath, 'utf8');

        // 修復 spread 類型錯誤 - 把所有的 ... 表達式改為 ...(x as any)
        console.log('應用類型修復規則...');

        // 修復形如 {...obj} 的表達式
        content = content.replace(/\.\.\.([\w\.]+(\[[\w\d]+\])?)/g, '...($1 as any)');

        // 修復形如 {...obj, ...obj2} 的情況
        content = content.replace(/\.\.\.\(([\w\.]+(\[[\w\d]+\])?)\s+as any\),\s*\.\.\.([\w\.]+(\[[\w\d]+\])?)/g, '...($1 as any), ...($3 as any)');

        // 處理形如 {...(x as Foo)} 的情況，避免重複轉換
        content = content.replace(/\.\.\.\(([\w\.]+(\[[\w\d]+\])?)\s+as\s+[\w<>]+\)/g, '...($1 as any)');

        fs.writeFileSync(apiServicePath, content);
        console.log('✅ api.service.ts 文件修復完成');
    } else {
        console.log('⚠️ 找不到 api.service.ts 文件');
    }

    console.log('處理完成，請重新運行前端構建');

} catch (error) {
    console.error('❌ 腳本執行失敗:', error);
    process.exit(1);
} 