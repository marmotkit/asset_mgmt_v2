#!/usr/bin/env node

// 前端構建腳本 - 用於 Render 部署
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 顯示標題
console.log('=== 資產管理系統前端部署構建 ===');

try {
  // 確保安裝所有依賴
  console.log('安裝所有必要的依賴項...');
  execSync('npm install buffer process --save', { stdio: 'inherit' });
  execSync('npm install webpack webpack-cli clean-webpack-plugin --save-dev', { stdio: 'inherit' });
  console.log('✅ 依賴項安裝完成');

  // 創建 webpack 配置文件
  console.log('確保 webpack 配置文件存在...');

  const webpackConfigPath = path.join(__dirname, 'webpack.prod.js');
  if (!fs.existsSync(webpackConfigPath)) {
    console.log('創建 webpack 生產配置文件...');

    const webpackConfig = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        main: ['buffer', './src/index.tsx']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        fallback: {
            "buffer": require.resolve("buffer/"),
            "stream": false,
            "path": false,
            "fs": false,
            "os": false,
            "util": false,
            "crypto": false
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
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            favicon: './public/favicon.ico'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: '.', globOptions: { ignore: ['**/index.html', '**/favicon.ico'] } }
            ]
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env': JSON.stringify({})
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
        splitChunks: {
            chunks: 'all',
        }
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};`;

    fs.writeFileSync(webpackConfigPath, webpackConfig);
    console.log('✅ webpack 配置文件創建完成');
  } else {
    console.log('✅ webpack 配置文件已存在');
  }

  // 修正 api.service.ts 中的類型錯誤
  console.log('檢查 api.service.ts 中的類型錯誤...');
  const apiServicePath = path.join(__dirname, 'src', 'services', 'api.service.ts');

  if (fs.existsSync(apiServicePath)) {
    let content = fs.readFileSync(apiServicePath, 'utf8');

    // 修復 spread 類型錯誤
    content = content.replace(/\.\.\.(\w+),/g, '...($1 as any),');
    content = content.replace(/\.\.\.ApiService\.mock(\w+)\[index\],/g, '...(ApiService.mock$1[index] as any),');

    fs.writeFileSync(apiServicePath, content);
    console.log('✅ api.service.ts 文件修復完成');
  }

  // 執行構建
  console.log('開始構建前端應用...');
  execSync('npx webpack --config webpack.prod.js', { stdio: 'inherit' });
  console.log('✅ 前端應用構建完成');

} catch (error) {
  console.error('❌ 構建失敗:', error);
  process.exit(1);
} 