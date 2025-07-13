#!/usr/bin/env node

console.log('===== Webpack 構建開始 =====');

// 設定環境變數
process.env.CI = 'true';
process.env.NODE_ENV = 'production';

try {
    // 直接使用 webpack API
    const webpack = require('webpack');
    const config = require('../webpack.prod.js');

    console.log('開始編譯...');

    const compiler = webpack(config);
    compiler.run((err, stats) => {
        if (err) {
            console.error('❌ 構建錯誤:', err);
            process.exit(1);
        }

        if (stats.hasErrors()) {
            console.error('❌ 構建失敗:', stats.toString({
                colors: true,
                errorDetails: true
            }));
            process.exit(1);
        }

        console.log('✅ 構建成功!');
        console.log(stats.toString({
            chunks: false,
            colors: true
        }));

        process.exit(0);
    });
} catch (error) {
    console.error('❌ 構建失敗:', error.message);
    process.exit(1);
} 