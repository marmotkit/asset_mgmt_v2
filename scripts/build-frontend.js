#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===== 開始前端構建流程 =====');

// 設定非互動式環境
process.env.CI = 'true';
process.env.NODE_ENV = 'production';

// 1. 檢查並修復構建問題
console.log('1. 執行構建問題修復...');
try {
    require('./fix-build.js');
} catch (error) {
    console.log('⚠️ fix-build.js 執行失敗，繼續執行...');
}

// 2. 確保 webpack-cli 已安裝
console.log('2. 檢查 webpack-cli...');
try {
    require.resolve('webpack-cli');
    console.log('✅ webpack-cli 已安裝');
} catch (e) {
    console.log('⚠️ webpack-cli 未安裝，正在安裝...');
    try {
        // 使用非互動式模式安裝
        execSync('npm install --save-dev webpack-cli --yes --no-audit --no-fund', {
            stdio: 'inherit',
            env: { ...process.env, CI: 'true', NODE_ENV: 'production' }
        });
        console.log('✅ webpack-cli 安裝成功');
    } catch (installError) {
        console.log('❌ webpack-cli 安裝失敗，嘗試直接執行 webpack...');
    }
}

// 3. 嘗試直接執行 webpack
console.log('3. 執行 webpack 構建...');
try {
    // 首先嘗試直接執行 webpack
    execSync('node ./node_modules/.bin/webpack --config webpack.prod.js', {
        stdio: 'inherit',
        env: { ...process.env, CI: 'true', NODE_ENV: 'production' }
    });
    console.log('✅ 前端構建成功');
} catch (error) {
    console.log('⚠️ 直接執行 webpack 失敗，嘗試使用 npx...');
    try {
        // 如果直接執行失敗，使用 npx 但設定非互動式環境
        execSync('npx --yes webpack --config webpack.prod.js', {
            stdio: 'inherit',
            env: { ...process.env, CI: 'true', NODE_ENV: 'production' }
        });
        console.log('✅ 使用 npx 構建成功');
    } catch (npxError) {
        console.error('❌ 所有構建方法都失敗:', npxError.message);
        process.exit(1);
    }
}

console.log('===== 前端構建完成 ====='); 