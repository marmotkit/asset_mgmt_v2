const fs = require('fs');
const path = require('path');

// 修正 accounting-journal.routes.ts
const journalPath = 'src/routes/accounting-journal.routes.ts';
let journalContent = fs.readFileSync(journalPath, 'utf8');
journalContent = journalContent.replace(
    /const total = parseInt\(countResult\[0\]\.total\);/g,
    'const total = parseInt((countResult[0] as any).total);'
);
fs.writeFileSync(journalPath, journalContent);
console.log('✓ 修正 accounting-journal.routes.ts');

// 修正 accounting-receivables.routes.ts
const receivablesPath = 'src/routes/accounting-receivables.routes.ts';
let receivablesContent = fs.readFileSync(receivablesPath, 'utf8');
receivablesContent = receivablesContent.replace(
    /const total = parseInt\(countResult\[0\]\.total\);/g,
    'const total = parseInt((countResult[0] as any).total);'
);
receivablesContent = receivablesContent.replace(
    /if \(existing\[0\]\.status === 'paid'\)/g,
    "if ((existing[0] as any).status === 'paid')"
);
receivablesContent = receivablesContent.replace(
    /const receivable = existing\[0\];/g,
    'const receivable = existing[0] as any;'
);
fs.writeFileSync(receivablesPath, receivablesContent);
console.log('✓ 修正 accounting-receivables.routes.ts');

// 修正 accounting-payables.routes.ts
const payablesPath = 'src/routes/accounting-payables.routes.ts';
let payablesContent = fs.readFileSync(payablesPath, 'utf8');
payablesContent = payablesContent.replace(
    /const total = parseInt\(countResult\[0\]\.total\);/g,
    'const total = parseInt((countResult[0] as any).total);'
);
payablesContent = payablesContent.replace(
    /if \(\(existing\[0\] as any\)\.status === 'paid'\)/g,
    "if ((existing[0] as any).status === 'paid')"
);
payablesContent = payablesContent.replace(
    /const payable = existing\[0\] as any;/g,
    'const payable = existing[0] as any;'
);
fs.writeFileSync(payablesPath, payablesContent);
console.log('✓ 修正 accounting-payables.routes.ts');

// 修正 accounting-monthly-closings.routes.ts
const closingsPath = 'src/routes/accounting-monthly-closings.routes.ts';
let closingsContent = fs.readFileSync(closingsPath, 'utf8');
closingsContent = closingsContent.replace(
    /const total = parseInt\(countResult\[0\]\.total\);/g,
    'const total = parseInt((countResult[0] as any).total);'
);
fs.writeFileSync(closingsPath, closingsContent);
console.log('✓ 修正 accounting-monthly-closings.routes.ts');

console.log('🎉 所有 TypeScript 類型錯誤修正完成！'); 