#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===== 開始前端構建流程 =====');

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
        execSync('npm install --save-dev webpack-cli --yes', {
            stdio: 'inherit',
            env: { ...process.env, CI: 'true' }
        });
        console.log('✅ webpack-cli 安裝成功');
    } catch (installError) {
        console.log('❌ webpack-cli 安裝失敗，嘗試使用 npx...');
        // 如果安裝失敗，使用 npx 執行 webpack
        try {
            execSync('npx webpack --config webpack.prod.js', {
                stdio: 'inherit',
                env: { ...process.env, CI: 'true' }
            });
            console.log('✅ 使用 npx 構建成功');
            process.exit(0);
        } catch (npxError) {
            console.error('❌ npx 構建也失敗:', npxError.message);
            process.exit(1);
        }
    }
}

// 3. 執行 webpack 構建
console.log('3. 執行 webpack 構建...');
try {
    execSync('npx webpack --config webpack.prod.js', {
        stdio: 'inherit',
        env: { ...process.env, CI: 'true' }
    });
    console.log('✅ 前端構建成功');
} catch (error) {
    console.error('❌ 前端構建失敗:', error.message);
    process.exit(1);
}

console.log('===== 前端構建完成 ====='); 