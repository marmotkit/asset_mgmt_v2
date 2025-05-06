const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// 確保可選依賴項安全加載
let CleanWebpackPlugin, TerserPlugin, CopyWebpackPlugin;
try {
    CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
} catch (e) {
    console.warn('clean-webpack-plugin 未安裝，跳過清理功能');
    CleanWebpackPlugin = class CleanWebpackPlugin {
        apply() { }
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
            this.apply = () => { };
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
    plugins.push(
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: '.', globOptions: { ignore: ['**/index.html', '**/favicon.ico'] } }
            ]
        })
    );
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
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
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
}; 