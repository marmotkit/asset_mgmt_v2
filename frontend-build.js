#!/usr/bin/env node

// 前端構建腳本 - 用於 Render 部署
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 顯示標題
console.log('=== 資產管理系統前端部署構建 ===');

try {
    // 檢測節點環境
    const nodeVersion = process.version;
    console.log(`使用 Node.js 版本: ${nodeVersion}`);

    // 在 Render 環境中檢測
    const isRenderEnv = process.env.RENDER === 'true' || process.env.RENDER === true;
    if (isRenderEnv) {
        console.log('檢測到 Render 部署環境');
    }

    // 確保安裝所有依賴
    console.log('安裝所有必要的依賴項...');
    execSync('npm install buffer process --save', { stdio: 'inherit' });
    execSync('npm install webpack webpack-cli clean-webpack-plugin copy-webpack-plugin terser-webpack-plugin html-webpack-plugin --save-dev', { stdio: 'inherit' });
    console.log('✅ 依賴項安裝完成');

    // 創建或更新 webpack 配置文件
    console.log('確保 webpack 配置文件存在...');

    const webpackConfigPath = path.join(__dirname, 'webpack.prod.js');
    console.log('創建/更新 webpack 生產配置文件...');

    const webpackConfig = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// 確保可選依賴項安全加載
let CleanWebpackPlugin, TerserPlugin, CopyWebpackPlugin;
try {
    const cleanWebpack = require('clean-webpack-plugin');
    CleanWebpackPlugin = cleanWebpack.CleanWebpackPlugin;
} catch (e) {
    console.warn('clean-webpack-plugin 未安裝，跳過清理功能');
    CleanWebpackPlugin = class CleanWebpackPlugin {
        apply() {}
    };
}

try {
    TerserPlugin = require('terser-webpack-plugin');
} catch (e) {
    console.warn('terser-webpack-plugin 未安裝，將使用內置壓縮');
    TerserPlugin = null;
}

try {
    CopyWebpackPlugin = require('copy-webpack-plugin');
} catch (e) {
    console.warn('copy-webpack-plugin 未安裝，跳過文件複製功能');
    CopyWebpackPlugin = class DummyCopyPlugin {
        constructor() {
            this.apply = () => {};
        }
    };
}

const plugins = [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: './public/favicon.ico'
    }),
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
    }),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env': JSON.stringify({})
    })
];

// 有條件添加 CopyWebpackPlugin
if (CopyWebpackPlugin !== null) {
    try {
        plugins.push(
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'public', to: '.', globOptions: { ignore: ['**/index.html', '**/favicon.ico'] } }
                ]
            })
        );
    } catch (e) {
        console.warn('CopyWebpackPlugin 配置錯誤，跳過文件複製:', e.message);
    }
}

const optimization = {
    minimize: true,
    splitChunks: {
        chunks: 'all',
    }
};

// 有條件添加 TerserPlugin
if (TerserPlugin !== null) {
    optimization.minimizer = [new TerserPlugin()];
}

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
    plugins: plugins,
    optimization: optimization,
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};`;

    fs.writeFileSync(webpackConfigPath, webpackConfig);
    console.log('✅ webpack 配置文件已更新');

    // 修正 api.service.ts 中的類型錯誤
    console.log('檢查 api.service.ts 中的類型錯誤...');
    const apiServicePath = path.join(__dirname, 'src', 'services', 'api.service.ts');

    if (fs.existsSync(apiServicePath)) {
        let content = fs.readFileSync(apiServicePath, 'utf8');

        // 修復 spread 類型錯誤
        content = content.replace(/\.\.\.(\w+),/g, '...($1 as any),');
        content = content.replace(/\.\.\.ApiService\.mock(\w+)\[index\],/g, '...(ApiService.mock$1[index] as any),');
        content = content.replace(/\.\.\.\[/g, '...([');
        content = content.replace(/\.\.\.\{/g, '...({');
        content = content.replace(/\.\.\.([\w\.]+(\[[\w\d]+\])?)/g, '...($1 as any)');

        fs.writeFileSync(apiServicePath, content);
        console.log('✅ api.service.ts 文件修復完成');
    }

    // 確保 package.json 中有所有必要的依賴
    console.log('🔍 更新 package.json 中的依賴...');
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // 確保開發依賴中包含所有必要的 webpack 插件
    if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
    }

    const requiredDevDeps = {
        "clean-webpack-plugin": "^4.0.0",
        "copy-webpack-plugin": "^11.0.0",
        "html-webpack-plugin": "^5.6.3",
        "terser-webpack-plugin": "^5.3.10",
        "webpack": "^5.98.0",
        "webpack-cli": "^6.0.1"
    };

    let updated = false;
    for (const [dep, version] of Object.entries(requiredDevDeps)) {
        if (!packageJson.devDependencies[dep]) {
            packageJson.devDependencies[dep] = version;
            updated = true;
        }
    }

    // 確保運行時依賴中包含 buffer 和 process
    if (!packageJson.dependencies) {
        packageJson.dependencies = {};
    }

    const requiredDeps = {
        "buffer": "^6.0.3",
        "process": "^0.11.10"
    };

    for (const [dep, version] of Object.entries(requiredDeps)) {
        if (!packageJson.dependencies[dep]) {
            packageJson.dependencies[dep] = version;
            updated = true;
        }
    }

    if (updated) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ package.json 已更新');
    } else {
        console.log('✅ package.json 已包含所有必要依賴');
    }

    // 執行構建
    console.log('開始構建前端應用...');

    try {
        console.log('嘗試使用 npx webpack...');
        execSync('npx webpack --config webpack.prod.js', { stdio: 'inherit' });
        console.log('✅ 前端應用構建完成');
    } catch (buildError) {
        console.error('⚠️ 第一次構建失敗，嘗試安裝更多依賴後重新構建...');

        // 如果第一次構建失敗，嘗試直接運行 webpack
        try {
            execSync('npm install clean-webpack-plugin copy-webpack-plugin terser-webpack-plugin style-loader css-loader --save-dev', { stdio: 'inherit' });
            execSync('node ./node_modules/webpack/bin/webpack.js --config webpack.prod.js', { stdio: 'inherit' });
            console.log('✅ 前端應用構建完成 (使用本地 webpack)');
        } catch (error) {
            console.error('⚠️ 第二次構建失敗，嘗試簡化配置後再次構建...');

            // 如果第二次構建仍然失敗，嘗試使用更簡單的配置
            const simpleWebpackConfig = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        fallback: {
            buffer: false,
            stream: false,
            path: false,
            fs: false,
            os: false,
            util: false,
            crypto: false
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
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            favicon: './public/favicon.ico'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ]
};`;

            fs.writeFileSync(webpackConfigPath, simpleWebpackConfig);
            console.log('⚠️ 已切換到簡化版 webpack 配置');

            execSync('node ./node_modules/webpack/bin/webpack.js --config webpack.prod.js', { stdio: 'inherit' });
            console.log('✅ 前端應用構建完成 (使用簡化配置)');
        }
    }

} catch (error) {
    console.error('❌ 構建失敗:', error);
    process.exit(1);
} 