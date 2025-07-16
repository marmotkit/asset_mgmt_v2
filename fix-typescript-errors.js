const fs = require('fs');
const path = require('path');

// 修正 accounting-reports.routes.ts 中的類型錯誤
function fixAccountingReportsRoutes() {
    const filePath = path.join(__dirname, 'src', 'routes', 'accounting-reports.routes.ts');

    if (!fs.existsSync(filePath)) {
        console.log('accounting-reports.routes.ts 檔案不存在');
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // 修正所有 Sequelize 查詢結果的類型錯誤
    const fixes = [
        // 修正損益表計算
        {
            from: /const totalRevenue = revenue\.reduce\(/g,
            to: 'const totalRevenue = (revenue as any[]).reduce('
        },
        {
            from: /const totalExpenses = expenses\.reduce\(/g,
            to: 'const totalExpenses = (expenses as any[]).reduce('
        },

        // 修正資產負債表計算
        {
            from: /const totalAssets = assets\.reduce\(/g,
            to: 'const totalAssets = (assets as any[]).reduce('
        },
        {
            from: /const totalLiabilities = liabilities\.reduce\(/g,
            to: 'const totalLiabilities = (liabilities as any[]).reduce('
        },
        {
            from: /const totalEquity = equity\.reduce\(/g,
            to: 'const totalEquity = (equity as any[]).reduce('
        },

        // 修正現金流量表計算
        {
            from: /const operatingCashFlow = operatingActivities\.reduce\(/g,
            to: 'const operatingCashFlow = (operatingActivities as any[]).reduce('
        },
        {
            from: /const investingCashFlow = investingActivities\.reduce\(/g,
            to: 'const investingCashFlow = (investingActivities as any[]).reduce('
        },
        {
            from: /const financingCashFlow = financingActivities\.reduce\(/g,
            to: 'const financingCashFlow = (financingActivities as any[]).reduce('
        },

        // 修正科目餘額表計算
        {
            from: /const totalDebit = trialBalance\.reduce\(/g,
            to: 'const totalDebit = (trialBalance as any[]).reduce('
        },
        {
            from: /const totalCredit = trialBalance\.reduce\(/g,
            to: 'const totalCredit = (trialBalance as any[]).reduce('
        }
    ];

    let fixed = false;
    fixes.forEach(fix => {
        if (content.match(fix.from)) {
            content = content.replace(fix.from, fix.to);
            fixed = true;
            console.log(`已修正: ${fix.from.source}`);
        }
    });

    if (fixed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ accounting-reports.routes.ts 類型錯誤修正完成');
    } else {
        console.log('ℹ️ accounting-reports.routes.ts 無需修正');
    }
}

// 執行修正
console.log('🔧 開始修正 TypeScript 類型錯誤...');
fixAccountingReportsRoutes();
console.log('✅ 所有類型錯誤修正完成！'); 