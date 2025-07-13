#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===== 簡單前端構建流程 =====');

// 設定非互動式環境
process.env.CI = 'true';
process.env.NODE_ENV = 'production';

// 1. 檢查 webpack 是否可用
console.log('1. 檢查 webpack...');
try {
    require.resolve('webpack');
    console.log('✅ webpack 已安裝');
} catch (e) {
    console.log('❌ webpack 未安裝，正在安裝...');
    try {
        execSync('npm install --save-dev webpack webpack-cli --yes --no-audit --no-fund', {
            stdio: 'inherit',
            env: { ...process.env, CI: 'true', NODE_ENV: 'production' }
        });
        console.log('✅ webpack 安裝成功');
    } catch (installError) {
        console.error('❌ webpack 安裝失敗:', installError.message);
        process.exit(1);
    }
}

// 2. 直接執行 webpack
console.log('2. 執行 webpack 構建...');
try {
    // 使用 require 直接執行 webpack
    const webpack = require('webpack');
    const config = require('../webpack.prod.js');

    console.log('開始編譯...');
    webpack(config, (err, stats) => {
        if (err || stats.hasErrors()) {
            console.error('❌ 構建失敗:', err || stats.toString());
            process.exit(1);
        }

        console.log('✅ 前端構建成功');
        console.log(stats.toString({
            chunks: false,
            colors: true
        }));
    });
} catch (error) {
    console.error('❌ 構建失敗:', error.message);
    process.exit(1);
}

console.log('===== 前端構建完成 ====='); 