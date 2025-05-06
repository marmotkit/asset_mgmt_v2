#!/usr/bin/env node

// 前端構建腳本 - 用於 Render 部署
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== 資產管理系統前端部署構建 ===');

// 確保所有必要的依賴項都安裝了
console.log('檢查並安裝所有必要的依賴項...');
const requiredDeps = [
    'webpack-cli',
    'webpack',
    'webpack-dev-server',
    'style-loader',
    'css-loader',
    'ts-loader',
    'html-webpack-plugin'
];

// 檢查 package.json 是否存在
if (!fs.existsSync('package.json')) {
    console.error('未找到 package.json 文件！');
    process.exit(1);
}

// 讀取 package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

// 安裝缺失的依賴項
const missingDeps = requiredDeps.filter(dep => !deps[dep]);
if (missingDeps.length > 0) {
    console.log('正在安裝缺失的依賴項:', missingDeps.join(', '));
    execSync(`npm install --save-dev ${missingDeps.join(' ')}`, { stdio: 'inherit' });
}

// 創建生產環境配置文件
console.log('創建 webpack 生產配置文件...');
const webpackProdConfig = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico'
    })
  ]
};
`;

fs.writeFileSync('webpack.prod.js', webpackProdConfig);

// 創建或更新 public/index.html 如果不存在
if (!fs.existsSync('public/index.html')) {
    console.log('創建 index.html 模板...');
    if (!fs.existsSync('public')) {
        fs.mkdirSync('public', { recursive: true });
    }

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="資產管理系統" />
    <title>資產管理系統</title>
  </head>
  <body>
    <noscript>您需要啟用 JavaScript 才能運行此應用程序。</noscript>
    <div id="root"></div>
  </body>
</html>
`;

    fs.writeFileSync('public/index.html', htmlTemplate);

    // 創建一個基本的 favicon.ico 文件
    if (!fs.existsSync('public/favicon.ico')) {
        // 複製一個示例文件或創建一個空文件
        fs.copyFileSync(
            path.resolve(__dirname, 'node_modules/webpack/favicon.ico'),
            'public/favicon.ico'
        );
    }
}

// 執行構建
console.log('開始構建前端應用...');
try {
    execSync('npx webpack --config webpack.prod.js', { stdio: 'inherit' });
    console.log('✅ 前端構建成功！');
} catch (error) {
    console.error('❌ 構建失敗:', error.message);
    process.exit(1);
} 