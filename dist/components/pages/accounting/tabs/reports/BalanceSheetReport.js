"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
// 註冊 ChartJS 組件
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.PieController, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
const BalanceSheetReport = ({ data }) => {
    // 檢查資料是否存在
    if (!data || !data.assets || !data.liabilities || !data.equity) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { children: (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "info", children: "\u76EE\u524D\u6C92\u6709\u8CC7\u7522\u8CA0\u50B5\u8868\u8CC7\u6599\uFF0C\u8ACB\u5148\u5EFA\u7ACB\u6703\u8A08\u79D1\u76EE\u548C\u5E33\u52D9\u8A18\u9304\u3002" }) }));
    }
    // 安全地取得數值，避免 undefined 錯誤
    const safeGetValue = (obj, path, defaultValue = 0) => {
        const keys = path.split('.');
        let value = obj;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                return defaultValue;
            }
        }
        return typeof value === 'number' ? value : defaultValue;
    };
    // 計算百分比
    const calculatePercentage = (amount, total) => {
        if (!amount || !total)
            return 0;
        return Math.round((amount / total) * 100);
    };
    // 從 API 資料中整理出前端需要的結構
    const processedData = {
        date: data.asOfDate || '未知日期',
        assets: {
            totalAssets: safeGetValue(data.assets, 'total', 0),
            currentAssets: {
                cash: 0,
                accountsReceivable: 0,
                inventory: 0,
                total: 0
            },
            nonCurrentAssets: {
                property: 0,
                equipment: 0,
                investments: 0,
                total: 0
            }
        },
        liabilities: {
            totalLiabilities: safeGetValue(data.liabilities, 'total', 0),
            currentLiabilities: {
                accountsPayable: 0,
                total: 0
            },
            nonCurrentLiabilities: {
                longTermDebt: 0,
                total: 0
            }
        },
        equity: {
            totalEquity: safeGetValue(data.equity, 'total', 0),
            capital: 0,
            retainedEarnings: 0
        }
    };
    // 處理資產項目
    if (data.assets && data.assets.items) {
        data.assets.items.forEach((item) => {
            var _a;
            const balance = parseFloat(item.balance) || 0;
            const accountName = ((_a = item.account_name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
            if (accountName.includes('現金') || accountName.includes('cash')) {
                processedData.assets.currentAssets.cash += balance;
            }
            else if (accountName.includes('應收') || accountName.includes('receivable')) {
                processedData.assets.currentAssets.accountsReceivable += balance;
            }
            else if (accountName.includes('存貨') || accountName.includes('inventory')) {
                processedData.assets.currentAssets.inventory += balance;
            }
            else if (accountName.includes('房產') || accountName.includes('property')) {
                processedData.assets.nonCurrentAssets.property += balance;
            }
            else if (accountName.includes('設備') || accountName.includes('equipment')) {
                processedData.assets.nonCurrentAssets.equipment += balance;
            }
            else if (accountName.includes('投資') || accountName.includes('investment')) {
                processedData.assets.nonCurrentAssets.investments += balance;
            }
        });
    }
    // 處理負債項目
    if (data.liabilities && data.liabilities.items) {
        data.liabilities.items.forEach((item) => {
            var _a;
            const balance = parseFloat(item.balance) || 0;
            const accountName = ((_a = item.account_name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
            if (accountName.includes('應付') || accountName.includes('payable')) {
                processedData.liabilities.currentLiabilities.accountsPayable += balance;
            }
            else if (accountName.includes('長期') || accountName.includes('long')) {
                processedData.liabilities.nonCurrentLiabilities.longTermDebt += balance;
            }
        });
    }
    // 處理權益項目
    if (data.equity && data.equity.items) {
        data.equity.items.forEach((item) => {
            var _a;
            const balance = parseFloat(item.balance) || 0;
            const accountName = ((_a = item.account_name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
            if (accountName.includes('資本') || accountName.includes('capital')) {
                processedData.equity.capital += balance;
            }
            else if (accountName.includes('盈餘') || accountName.includes('retained')) {
                processedData.equity.retainedEarnings += balance;
            }
        });
    }
    // 計算小計
    processedData.assets.currentAssets.total =
        processedData.assets.currentAssets.cash +
            processedData.assets.currentAssets.accountsReceivable +
            processedData.assets.currentAssets.inventory;
    processedData.assets.nonCurrentAssets.total =
        processedData.assets.nonCurrentAssets.property +
            processedData.assets.nonCurrentAssets.equipment +
            processedData.assets.nonCurrentAssets.investments;
    processedData.liabilities.currentLiabilities.total =
        processedData.liabilities.currentLiabilities.accountsPayable;
    processedData.liabilities.nonCurrentLiabilities.total =
        processedData.liabilities.nonCurrentLiabilities.longTermDebt;
    // 準備資產餅圖數據
    const prepareAssetsPieData = () => {
        const currentAssets = processedData.assets.currentAssets.total;
        const nonCurrentAssets = processedData.assets.nonCurrentAssets.total;
        return {
            labels: ['流動資產', '非流動資產'],
            datasets: [
                {
                    data: [currentAssets, nonCurrentAssets],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };
    // 準備負債和權益餅圖數據
    const prepareLiabilitiesEquityPieData = () => {
        const totalLiabilities = processedData.liabilities.totalLiabilities;
        const totalEquity = processedData.equity.totalEquity;
        return {
            labels: ['負債', '權益'],
            datasets: [
                {
                    data: [totalLiabilities, totalEquity],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", gutterBottom: true, children: ["\u8CC7\u7522\u8CA0\u50B5\u8868 - ", processedData.date] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u7E3D\u8CC7\u7522" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: "primary.main", children: [processedData.assets.totalAssets.toLocaleString(), " \u5143"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u7E3D\u8CA0\u50B5" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: "error.main", children: [processedData.liabilities.totalLiabilities.toLocaleString(), " \u5143"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u7E3D\u6B0A\u76CA" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: "success.main", children: [processedData.equity.totalEquity.toLocaleString(), " \u5143"] })] })] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u8CC7\u7522\u7D44\u6210" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 300 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Pie, { data: prepareAssetsPieData(), options: {
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'right',
                                                    }
                                                }
                                            } }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u8CA0\u50B5\u8207\u6B0A\u76CA" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 300 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Pie, { data: prepareLiabilitiesEquityPieData(), options: {
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'right',
                                                    }
                                                }
                                            } }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u8CC7\u7522\u660E\u7D30" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, elevation: 0, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 3, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: "\u6D41\u52D5\u8CC7\u7522" }) }) }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u73FE\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: processedData.assets.currentAssets.cash.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(processedData.assets.currentAssets.cash, processedData.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u61C9\u6536\u5E33\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: processedData.assets.currentAssets.accountsReceivable.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(processedData.assets.currentAssets.accountsReceivable, processedData.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5B58\u8CA8" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: processedData.assets.currentAssets.inventory.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(processedData.assets.currentAssets.inventory, processedData.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u6D41\u52D5\u8CC7\u7522\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: processedData.assets.currentAssets.total.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(processedData.assets.currentAssets.total, processedData.assets.totalAssets), "%"] }) })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 3, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: "\u975E\u6D41\u52D5\u8CC7\u7522" }) }) }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u623F\u7522" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: processedData.assets.nonCurrentAssets.property.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(processedData.assets.nonCurrentAssets.property, processedData.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u8A2D\u5099" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: processedData.assets.nonCurrentAssets.equipment.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(processedData.assets.nonCurrentAssets.equipment, processedData.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: processedData.assets.nonCurrentAssets.investments.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(processedData.assets.nonCurrentAssets.investments, processedData.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u975E\u6D41\u52D5\u8CC7\u7522\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: processedData.assets.nonCurrentAssets.total.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(processedData.assets.nonCurrentAssets.total, processedData.assets.totalAssets), "%"] }) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u8CC7\u7522\u7E3D\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: processedData.assets.totalAssets.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: "100%" }) })] })] })] }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u8CA0\u50B5\u8207\u6B0A\u76CA\u660E\u7D30" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, elevation: 0, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 3, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: "\u6D41\u52D5\u8CA0\u50B5" }) }) }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u61C9\u4ED8\u5E33\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: processedData.liabilities.currentLiabilities.accountsPayable.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(processedData.liabilities.currentLiabilities.accountsPayable, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u6D41\u52D5\u8CA0\u50B5\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: processedData.liabilities.currentLiabilities.total.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(processedData.liabilities.currentLiabilities.total, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity), "%"] }) })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 3, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: "\u975E\u6D41\u52D5\u8CA0\u50B5" }) }) }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u9577\u671F\u8CA0\u50B5" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: processedData.liabilities.nonCurrentLiabilities.longTermDebt.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(processedData.liabilities.nonCurrentLiabilities.longTermDebt, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u975E\u6D41\u52D5\u8CA0\u50B5\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: processedData.liabilities.nonCurrentLiabilities.total.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(processedData.liabilities.nonCurrentLiabilities.total, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity), "%"] }) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u8CA0\u50B5\u7E3D\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: processedData.liabilities.totalLiabilities.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(processedData.liabilities.totalLiabilities, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity), "%"] }) })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 3, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: "\u6B0A\u76CA" }) }) }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u8CC7\u672C" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: processedData.equity.capital.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(processedData.equity.capital, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u4FDD\u7559\u76C8\u9918" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: processedData.equity.retainedEarnings.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(processedData.equity.retainedEarnings, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u6B0A\u76CA\u7E3D\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: processedData.equity.totalEquity.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(processedData.equity.totalEquity, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity), "%"] }) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u8CA0\u50B5\u53CA\u6B0A\u76CA\u7E3D\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: (processedData.liabilities.totalLiabilities + processedData.equity.totalEquity).toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: "100%" }) })] })] })] }) })] }) }) })] })] }));
};
exports.default = BalanceSheetReport;
