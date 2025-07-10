"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
// 註冊 ChartJS 組件
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.PieController, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
const BalanceSheetReport = ({ data }) => {
    // 計算百分比
    const calculatePercentage = (amount, total) => {
        if (!amount || !total)
            return 0;
        return Math.round((amount / total) * 100);
    };
    // 準備資產餅圖數據
    const prepareAssetsPieData = () => {
        const currentAssets = data.assets.currentAssets.total;
        const nonCurrentAssets = data.assets.nonCurrentAssets.total;
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
        const totalLiabilities = data.liabilities.totalLiabilities;
        const totalEquity = data.equity.totalEquity;
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
    // 準備流動資產明細
    const prepareCurrentAssetsData = () => {
        const { cash, accountsReceivable, inventory, total, ...rest } = data.assets.currentAssets;
        let otherAssets = 0;
        // 安全地計算其他資產
        Object.values(rest).forEach((value) => {
            if (typeof value === 'number') {
                otherAssets += value;
            }
        });
        return {
            labels: ['現金', '應收帳款', '庫存', '其他流動資產'],
            datasets: [
                {
                    data: [cash || 0, accountsReceivable || 0, inventory || 0, otherAssets || 0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", gutterBottom: true, children: ["\u8CC7\u7522\u8CA0\u50B5\u8868 - ", data.date] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u7E3D\u8CC7\u7522" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: "primary.main", children: [data.assets.totalAssets.toLocaleString(), " \u5143"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u7E3D\u8CA0\u50B5" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: "error.main", children: [data.liabilities.totalLiabilities.toLocaleString(), " \u5143"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u7E3D\u6B0A\u76CA" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: "success.main", children: [data.equity.totalEquity.toLocaleString(), " \u5143"] })] })] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u8CC7\u7522\u7D44\u6210" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 300 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Pie, { data: prepareAssetsPieData(), options: {
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
                                            } }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u8CC7\u7522\u660E\u7D30" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, elevation: 0, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 3, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: "\u6D41\u52D5\u8CC7\u7522" }) }) }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u73FE\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: data.assets.currentAssets.cash.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(data.assets.currentAssets.cash, data.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u61C9\u6536\u5E33\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: data.assets.currentAssets.accountsReceivable.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(data.assets.currentAssets.accountsReceivable, data.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5EAB\u5B58" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: data.assets.currentAssets.inventory.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(data.assets.currentAssets.inventory, data.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u6D41\u52D5\u8CC7\u7522\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: data.assets.currentAssets.total.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(data.assets.currentAssets.total, data.assets.totalAssets), "%"] }) })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 3, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: "\u975E\u6D41\u52D5\u8CC7\u7522" }) }) }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u623F\u7522" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: data.assets.nonCurrentAssets.property.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(data.assets.nonCurrentAssets.property, data.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u8A2D\u5099" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: data.assets.nonCurrentAssets.equipment.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(data.assets.nonCurrentAssets.equipment, data.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: data.assets.nonCurrentAssets.investments.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(data.assets.nonCurrentAssets.investments, data.assets.totalAssets), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u975E\u6D41\u52D5\u8CC7\u7522\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: data.assets.nonCurrentAssets.total.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(data.assets.nonCurrentAssets.total, data.assets.totalAssets), "%"] }) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u8CC7\u7522\u7E3D\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: data.assets.totalAssets.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: "100%" }) })] })] })] }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u8CA0\u50B5\u8207\u6B0A\u76CA\u660E\u7D30" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, elevation: 0, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 3, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: "\u6D41\u52D5\u8CA0\u50B5" }) }) }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u61C9\u4ED8\u5E33\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: data.liabilities.currentLiabilities.accountsPayable.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(data.liabilities.currentLiabilities.accountsPayable, data.liabilities.totalLiabilities + data.equity.totalEquity), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u77ED\u671F\u501F\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: data.liabilities.currentLiabilities.shortTermLoans.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(data.liabilities.currentLiabilities.shortTermLoans, data.liabilities.totalLiabilities + data.equity.totalEquity), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u6D41\u52D5\u8CA0\u50B5\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: data.liabilities.currentLiabilities.total.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(data.liabilities.currentLiabilities.total, data.liabilities.totalLiabilities + data.equity.totalEquity), "%"] }) })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 3, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: "\u975E\u6D41\u52D5\u8CA0\u50B5" }) }) }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u9577\u671F\u501F\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: data.liabilities.nonCurrentLiabilities.longTermLoans.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(data.liabilities.nonCurrentLiabilities.longTermLoans, data.liabilities.totalLiabilities + data.equity.totalEquity), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u975E\u6D41\u52D5\u8CA0\u50B5\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: data.liabilities.nonCurrentLiabilities.total.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(data.liabilities.nonCurrentLiabilities.total, data.liabilities.totalLiabilities + data.equity.totalEquity), "%"] }) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u8CA0\u50B5\u7E3D\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: data.liabilities.totalLiabilities.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(data.liabilities.totalLiabilities, data.liabilities.totalLiabilities + data.equity.totalEquity), "%"] }) })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 3, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: "\u6B0A\u76CA" }) }) }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u8CC7\u672C" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: data.equity.capital.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(data.equity.capital, data.liabilities.totalLiabilities + data.equity.totalEquity), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u4FDD\u7559\u76C8\u9918" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: data.equity.retainedEarnings.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(data.equity.retainedEarnings, data.liabilities.totalLiabilities + data.equity.totalEquity), "%"] })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u6B0A\u76CA\u7E3D\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: data.equity.totalEquity.toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsxs)("strong", { children: [calculatePercentage(data.equity.totalEquity, data.liabilities.totalLiabilities + data.equity.totalEquity), "%"] }) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u8CA0\u50B5\u53CA\u6B0A\u76CA\u7E3D\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: (data.liabilities.totalLiabilities + data.equity.totalEquity).toLocaleString() }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: "100%" }) })] })] })] }) })] }) }) })] })] }));
};
exports.default = BalanceSheetReport;
