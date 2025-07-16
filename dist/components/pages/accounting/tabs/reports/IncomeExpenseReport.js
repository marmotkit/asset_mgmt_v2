"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
// 註冊 ChartJS 組件
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
const IncomeExpenseReport = ({ data }) => {
    // 從 API 資料中提取收入和費用資料
    const revenue = data.revenue || { items: [], total: 0 };
    const expenses = data.expenses || { items: [], total: 0 };
    const netIncome = data.netIncome || 0;
    const period = data.period || {};
    // 處理圖表數據
    const prepareBarChartData = () => {
        return {
            labels: ['收入', '費用', '淨利'],
            datasets: [
                {
                    data: [revenue.total, expenses.total, netIncome],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        netIncome >= 0
                            ? 'rgba(54, 162, 235, 0.6)'
                            : 'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        netIncome >= 0
                            ? 'rgba(54, 162, 235, 1)'
                            : 'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };
    // 收入分析的餅圖數據
    const prepareRevenuePieChartData = () => {
        return {
            labels: revenue.items.map((item) => item.account_name),
            datasets: [
                {
                    data: revenue.items.map((item) => Math.abs(parseFloat(item.balance))),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 99, 132, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };
    // 費用分析的餅圖數據
    const prepareExpensePieChartData = () => {
        return {
            labels: expenses.items.map((item) => item.account_name),
            datasets: [
                {
                    data: expenses.items.map((item) => Math.abs(parseFloat(item.balance))),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(54, 162, 235, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };
    // 計算百分比
    const calculatePercentage = (amount, total) => {
        if (!total)
            return 0;
        return ((amount / total) * 100).toFixed(1);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: period.startDate && period.endDate ?
                                `${period.startDate} 至 ${period.endDate} 損益表` :
                                '損益表' }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u7E3D\u6536\u5165" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: "success.main", children: [revenue.total.toLocaleString(), " \u5143"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u7E3D\u8CBB\u7528" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: "error.main", children: [expenses.total.toLocaleString(), " \u5143"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u6DE8\u5229" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: netIncome >= 0 ? "success.main" : "error.main", children: [netIncome.toLocaleString(), " \u5143"] })] })] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u640D\u76CA\u5C0D\u6BD4" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 300 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Bar, { data: prepareBarChartData(), options: {
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'top',
                                                    },
                                                    title: {
                                                        display: false
                                                    }
                                                }
                                            } }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6536\u5165\u5206\u6790" }), revenue.items && revenue.items.length > 0 ? ((0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 240 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Pie, { data: prepareRevenuePieChartData(), options: {
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: {
                                                                    position: 'right',
                                                                }
                                                            }
                                                        } }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TableContainer, { children: (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u79D1\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u767E\u5206\u6BD4" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: revenue.items.map((item) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: item.account_name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: Math.abs(parseFloat(item.balance)).toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(Math.abs(parseFloat(item.balance)), revenue.total), "%"] })] }, item.account_code))) })] }) }) })] })) : ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", color: "textSecondary", align: "center", sx: { py: 3 }, children: "\u6B64\u671F\u9593\u7121\u6536\u5165\u6578\u64DA" }))] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u8CBB\u7528\u5206\u6790" }), expenses.items && expenses.items.length > 0 ? ((0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 240 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Pie, { data: prepareExpensePieChartData(), options: {
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: {
                                                                    position: 'right',
                                                                }
                                                            }
                                                        } }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TableContainer, { children: (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u79D1\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u767E\u5206\u6BD4" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: expenses.items.map((item) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: item.account_name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: Math.abs(parseFloat(item.balance)).toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(Math.abs(parseFloat(item.balance)), expenses.total), "%"] })] }, item.account_code))) })] }) }) })] })) : ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", color: "textSecondary", align: "center", sx: { py: 3 }, children: "\u6B64\u671F\u9593\u7121\u8CBB\u7528\u6578\u64DA" }))] }) }) })] })] }));
};
exports.default = IncomeExpenseReport;
