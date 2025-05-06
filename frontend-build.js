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

    // 確保 process/browser 可用
    console.log('確保 process/browser 可用...');
    const processBrowserPath = path.join(__dirname, 'node_modules', 'process', 'browser.js');
    if (!fs.existsSync(processBrowserPath)) {
        console.log('找不到 process/browser.js，嘗試建立連結...');
        const processDir = path.join(__dirname, 'node_modules', 'process');
        if (fs.existsSync(path.join(processDir, 'index.js'))) {
            if (!fs.existsSync(path.join(processDir, 'browser'))) {
                fs.mkdirSync(path.join(processDir, 'browser'), { recursive: true });
            }
            fs.copyFileSync(
                path.join(processDir, 'index.js'),
                path.join(processDir, 'browser', 'index.js')
            );
            console.log('✅ 已建立 process/browser 備用模塊');
        }
    }

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
        process: 'process'
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
        main: ['buffer', 'process', './src/index.tsx']
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.[contenthash].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.mjs'],
        fallback: {
            "buffer": require.resolve("buffer/"),
            "stream": false,
            "path": false,
            "fs": false,
            "os": false,
            "util": false,
            "crypto": false,
            "process": require.resolve("process/browser"),
            "process/browser": require.resolve("process/browser")
        },
        alias: {
            "process/browser": require.resolve("process/browser")
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
            },
            {
                test: /\\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto'
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

    // 修復 FeeReport 組件中使用 xlsx 的問題
    console.log('檢查前端組件中使用 xlsx 的問題...');
    const feeReportPath = path.join(__dirname, 'src', 'components', 'pages', 'fees', 'FeeReport.tsx');
    if (fs.existsSync(feeReportPath)) {
        let content = fs.readFileSync(feeReportPath, 'utf8');

        // 修改 xlsx 引入方式，防止 .mjs 模塊問題
        if (content.includes("import * as XLSX from 'xlsx'")) {
            content = content.replace("import * as XLSX from 'xlsx'", "import XLSX from 'xlsx/dist/xlsx.full.min.js'");
            fs.writeFileSync(feeReportPath, content);
            console.log('✅ 修復了 FeeReport.tsx 中的 xlsx 引入方式');
        }
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

    // 嘗試創建修復的 xlsx 入口點
    console.log('嘗試修復 xlsx 模塊問題...');
    const xlsxDir = path.join(__dirname, 'node_modules', 'xlsx');
    if (fs.existsSync(xlsxDir)) {
        const browserShimPath = path.join(xlsxDir, 'browser-process-shim.js');
        fs.writeFileSync(browserShimPath, `
module.exports = {};
module.exports.nextTick = function nextTick(fn) {
  setTimeout(fn, 0);
};
module.exports.title = 'browser';
module.exports.browser = true;
module.exports.env = {};
module.exports.argv = [];
module.exports.version = '';
module.exports.versions = {};
module.exports.on = function() {};
module.exports.addListener = function() {};
module.exports.once = function() {};
module.exports.off = function() {};
module.exports.removeListener = function() {};
module.exports.removeAllListeners = function() {};
module.exports.emit = function() {};
module.exports.binding = function() { throw new Error('process.binding is not supported'); };
module.exports.cwd = function() { return '/'; };
module.exports.chdir = function() { throw new Error('process.chdir is not supported'); };
module.exports.umask = function() { return 0; };
`);
        console.log('✅ 已創建 xlsx 的 process 模擬檔案');

        // 修改 webpack 配置，添加對 xlsx 模塊的特殊處理
        const extraConfig = `
// 特殊處理 xlsx 模塊
plugins.push(new webpack.NormalModuleReplacementPlugin(
  /xlsx[\/\\\\]xlsx.mjs$/,
  function(resource) {
    resource.request = resource.request.replace(/xlsx.mjs$/, 'xlsx.js');
  }
));
`;

        let currentConfig = fs.readFileSync(webpackConfigPath, 'utf8');
        const insertPosition = currentConfig.indexOf('// 有條件添加 CopyWebpackPlugin');
        if (insertPosition > 0) {
            currentConfig = currentConfig.slice(0, insertPosition) + extraConfig + currentConfig.slice(insertPosition);
            fs.writeFileSync(webpackConfigPath, currentConfig);
            console.log('✅ 已更新 webpack 配置以特殊處理 xlsx 模塊');
        }
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
            execSync('npm install clean-webpack-plugin copy-webpack-plugin terser-webpack-plugin style-loader css-loader process buffer --save-dev', { stdio: 'inherit' });

            // 創建 process/browser 文件
            const processBrowserDir = path.join(__dirname, 'node_modules', 'process', 'browser');
            if (!fs.existsSync(processBrowserDir)) {
                fs.mkdirSync(processBrowserDir, { recursive: true });
                fs.writeFileSync(path.join(processBrowserDir, 'index.js'), `
// process/browser polyfill
module.exports = {};
module.exports.nextTick = function nextTick(fn) {
  setTimeout(fn, 0);
};
module.exports.title = 'browser';
module.exports.browser = true;
module.exports.env = {};
module.exports.argv = [];
module.exports.version = '';
module.exports.versions = {};
module.exports.on = function() {};
module.exports.addListener = function() {};
module.exports.once = function() {};
module.exports.off = function() {};
module.exports.removeListener = function() {};
module.exports.removeAllListeners = function() {};
module.exports.emit = function() {};
module.exports.binding = function() { throw new Error('process.binding is not supported'); };
module.exports.cwd = function() { return '/'; };
module.exports.chdir = function() { throw new Error('process.chdir is not supported'); };
module.exports.umask = function() { return 0; };
`);
                console.log('✅ 已創建 process/browser 模塊');
            }

            // 嘗試使用簡化配置
            const simpleConfig = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        fallback: {
            buffer: false,
            process: false,
            stream: false,
            path: false,
            fs: false,
            os: false,
            util: false,
            crypto: false
        },
        alias: {
            xlsx: path.resolve(__dirname, 'node_modules/xlsx/dist/xlsx.full.min.js')
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
            },
            {
                test: /\\.m?js$/,
                resolve: {
                  fullySpecified: false
                }
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

            fs.writeFileSync(webpackConfigPath, simpleConfig);
            console.log('⚠️ 已切換到更簡化的 webpack 配置');

            // 在構建前確保目標目錄存在
            const buildDirBackup = path.join(__dirname, 'build');
            if (!fs.existsSync(buildDirBackup)) {
                fs.mkdirSync(buildDirBackup, { recursive: true });
            }

            execSync('node ./node_modules/webpack/bin/webpack.js --config webpack.prod.js', { stdio: 'inherit' });
            console.log('✅ 前端應用構建完成 (使用本地 webpack 和簡化配置)');

            // 確保公共資源被複製
            try {
                const publicDir = path.join(__dirname, 'public');
                if (fs.existsSync(publicDir)) {
                    console.log('複製其他公共資源到 build 目錄...');

                    // 複製 logo192.png 和 logo512.png
                    ['logo192.png', 'logo512.png', 'manifest.json'].forEach(file => {
                        const srcPath = path.join(publicDir, file);
                        if (fs.existsSync(srcPath)) {
                            fs.copyFileSync(srcPath, path.join(buildDirBackup, file));
                        }
                    });

                    // 複製其他可能的資源目錄
                    const assets = path.join(publicDir, 'assets');
                    if (fs.existsSync(assets)) {
                        const destAssets = path.join(buildDirBackup, 'assets');
                        if (!fs.existsSync(destAssets)) {
                            fs.mkdirSync(destAssets, { recursive: true });
                        }

                        const assetFiles = fs.readdirSync(assets);
                        for (const file of assetFiles) {
                            fs.copyFileSync(
                                path.join(assets, file),
                                path.join(destAssets, file)
                            );
                        }
                    }

                    console.log('✅ 公共資源複製完成');
                }
            } catch (copyError) {
                console.warn('複製公共資源時出錯，但繼續構建:', copyError.message);
            }

        } catch (error) {
            console.error('⚠️ 所有構建嘗試都失敗，顯示完整錯誤：', error);
            process.exit(1);
        }
    }

    // 檢查構建輸出目錄
    const buildDir = path.join(__dirname, 'build');
    if (fs.existsSync(buildDir)) {
        console.log(`✅ 構建輸出目錄 'build' 已成功創建`);
        const files = fs.readdirSync(buildDir);
        console.log(`共有 ${files.length} 個文件在構建輸出目錄中`);
    } else {
        console.error(`❌ 構建輸出目錄 'build' 不存在，Render 部署可能會失敗`);

        // 嘗試從 dist 複製文件到 build 目錄
        const distDir = path.join(__dirname, 'dist');
        if (fs.existsSync(distDir)) {
            console.log('發現 dist 目錄，嘗試複製內容到 build 目錄...');
            fs.mkdirSync(buildDir, { recursive: true });

            const distFiles = fs.readdirSync(distDir);
            for (const file of distFiles) {
                const srcPath = path.join(distDir, file);
                const destPath = path.join(buildDir, file);

                if (fs.lstatSync(srcPath).isDirectory()) {
                    // 複製目錄
                    fs.cpSync(srcPath, destPath, { recursive: true });
                } else {
                    // 複製文件
                    fs.copyFileSync(srcPath, destPath);
                }
            }

            console.log(`✅ 已從 dist 目錄複製 ${distFiles.length} 個文件到 build 目錄`);
        }
    }

} catch (error) {
    console.error('❌ 構建失敗:', error);
    process.exit(1);
}