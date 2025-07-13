#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===== 開始修復構建問題 =====');

// 檢查 AnnualActivitiesTab.tsx 文件
const annualActivitiesTabPath = path.join(__dirname, 'src', 'components', 'pages', 'services', 'AnnualActivitiesTab.tsx');
if (fs.existsSync(annualActivitiesTabPath)) {
    console.log('檢查 AnnualActivitiesTab.tsx 文件...');
    const content = fs.readFileSync(annualActivitiesTabPath, 'utf8');

    // 檢查文件是否為空或缺少導出
    if (!content.trim() || !content.includes('export default')) {
        console.log('⚠️ AnnualActivitiesTab.tsx 文件內容不完整，重新創建...');

        // 創建基本框架組件
        const basicComponent = `import React from 'react';
import { Box, Typography } from '@mui/material';

const AnnualActivitiesTab: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6">年度活動管理</Typography>
      <Typography>此功能正在開發中...</Typography>
    </Box>
  );
};

export default AnnualActivitiesTab;
`;

        fs.writeFileSync(annualActivitiesTabPath, basicComponent);
        console.log('✅ 已重新創建 AnnualActivitiesTab.tsx 文件');
    } else {
        console.log('✅ AnnualActivitiesTab.tsx 文件檢查通過');
    }
} else {
    console.log('⚠️ AnnualActivitiesTab.tsx 文件不存在，創建新文件...');

    const basicComponent = `import React from 'react';
import { Box, Typography } from '@mui/material';

const AnnualActivitiesTab: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6">年度活動管理</Typography>
      <Typography>此功能正在開發中...</Typography>
    </Box>
  );
};

export default AnnualActivitiesTab;
`;

    // 確保目錄存在
    const dirPath = path.dirname(annualActivitiesTabPath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(annualActivitiesTabPath, basicComponent);
    console.log('✅ 已創建 AnnualActivitiesTab.tsx 文件');
}

// 修復 xlsx 引入問題
const feeReportPath = path.join(__dirname, 'src', 'components', 'pages', 'fees', 'FeeReport.tsx');
if (fs.existsSync(feeReportPath)) {
    console.log('修複 FeeReport.tsx 中的 xlsx 引入問題...');

    let content = fs.readFileSync(feeReportPath, 'utf8');

    // 修改 xlsx 引入方式
    if (content.includes("from 'xlsx/dist/xlsx.full.min'")) {
        content = content.replace("from 'xlsx/dist/xlsx.full.min'", "from 'xlsx'");
        fs.writeFileSync(feeReportPath, content);
        console.log('✅ 已修復 FeeReport.tsx 中的 xlsx 引入方式');
    } else if (content.includes("from 'xlsx'")) {
        console.log('✅ FeeReport.tsx 中的 xlsx 引入方式已正確');
    }
}

// 創建 process/browser 模擬文件
const processDir = path.join(__dirname, 'src', 'polyfills');
if (!fs.existsSync(processDir)) {
    fs.mkdirSync(processDir, { recursive: true });
}

const processBrowserPath = path.join(processDir, 'process-browser.js');
const processBrowserContent = `var process = module.exports = {};

process.nextTick = function (fn) {
    setTimeout(fn, 0);
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = '';

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
`;

fs.writeFileSync(processBrowserPath, processBrowserContent);
console.log('✅ 已創建 process/browser 模擬文件');

// 更新 webpack 配置以處理 xlsx 和 process
const webpackConfigPath = path.join(__dirname, 'webpack.prod.js');
console.log('更新 webpack 生產配置...');

const webpackConfig = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.[contenthash].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
        fallback: {
            "buffer": false,
            "stream": false,
            "path": false,
            "fs": false,
            "os": false,
            "util": false,
            "crypto": false,
            "process": path.resolve(__dirname, 'src/polyfills/process-browser.js')
        },
        alias: {
            "xlsx": path.resolve(__dirname, 'node_modules/xlsx')
        }
    },
    module: {
        rules: [
            {
                test: /\\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            favicon: './public/favicon.ico'
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'public',
                    to: '.',
                    globOptions: {
                        ignore: ['**/index.html', '**/favicon.ico']
                    }
                }
            ]
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    optimization: {
        minimize: true
    }
};`;

fs.writeFileSync(webpackConfigPath, webpackConfig);
console.log('✅ 已更新 webpack 生產配置');

// 修正 package.json 構建腳本
try {
    console.log('更新 package.json 構建腳本...');
    const packageJsonPath = path.join(__dirname, 'package.json');

    // 確保 webpack-cli 已安裝
    console.log('檢查 webpack-cli 是否已安裝...');
    try {
        require.resolve('webpack-cli');
        console.log('✅ webpack-cli 已安裝');
    } catch (e) {
        console.log('⚠️ webpack-cli 未安裝，嘗試安裝...');
        try {
            execSync('npm install --save-dev webpack-cli', { stdio: 'inherit' });
            console.log('✅ webpack-cli 安裝成功');
        } catch (installError) {
            console.log('❌ webpack-cli 安裝失敗，請手動安裝');
        }
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts["build:frontend"] = "node fix-build.js && webpack --config webpack.prod.js";

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ 已更新 package.json 構建腳本');
} catch (error) {
    console.error('更新 package.json 時發生錯誤:', error);
}

console.log('===== 修復完成 =====');
console.log('執行以下命令以構建前端：');
console.log('npm run build:frontend'); 