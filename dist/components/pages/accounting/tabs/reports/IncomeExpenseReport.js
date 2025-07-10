"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
// 註冊 ChartJS 組件
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
const IncomeExpenseReport = ({ data }) => {
    var _a, _b;
    // 處理圖表數據
    const prepareBarChartData = () => {
        if (data.monthlyData) {
            // 年度報表
            return {
                labels: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
                datasets: [
                    {
                        label: '收入',
                        data: data.monthlyData.map((monthData) => monthData.income),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '支出',
                        data: data.monthlyData.map((monthData) => monthData.expense),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            };
        }
        else {
            // 月度報表
            return {
                labels: ['收入', '支出', '淨額'],
                datasets: [
                    {
                        data: [data.totalIncome, data.totalExpense, data.totalIncome - data.totalExpense],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                            data.totalIncome - data.totalExpense >= 0
                                ? 'rgba(54, 162, 235, 0.6)'
                                : 'rgba(255, 159, 64, 0.6)'
                        ],
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 1)',
                            data.totalIncome - data.totalExpense >= 0
                                ? 'rgba(54, 162, 235, 1)'
                                : 'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }
                ]
            };
        }
    };
    // 類別分析的餅圖數據
    const preparePieChartData = (type) => {
        var _a;
        const categories = ((_a = data.categories) === null || _a === void 0 ? void 0 : _a[type]) || [];
        return {
            labels: categories.map((cat) => cat.category),
            datasets: [
                {
                    data: categories.map((cat) => cat.amount),
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
    // 計算百分比
    const calculatePercentage = (amount, total) => {
        if (!total)
            return 0;
        return ((amount / total) * 100).toFixed(1);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: data.month ? `${data.year}年${data.month}月 財務概覽` : `${data.year}年度 財務概覽` }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u7E3D\u6536\u5165" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: "success.main", children: [data.totalIncome.toLocaleString(), " \u5143"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u7E3D\u652F\u51FA" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: "error.main", children: [data.totalExpense.toLocaleString(), " \u5143"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u6DE8\u6536\u5165" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: (data.totalIncome - data.totalExpense) >= 0 ? "success.main" : "error.main", children: [(data.totalIncome - data.totalExpense).toLocaleString(), " \u5143"] })] })] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6536\u652F\u5C0D\u6BD4" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 300 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Bar, { data: prepareBarChartData(), options: {
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
                                            } }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6536\u5165\u5206\u6790" }), ((_a = data.categories) === null || _a === void 0 ? void 0 : _a.income) && data.categories.income.length > 0 ? ((0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 240 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Pie, { data: preparePieChartData('income'), options: {
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: {
                                                                    position: 'right',
                                                                }
                                                            }
                                                        } }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TableContainer, { children: (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u985E\u5225" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u767E\u5206\u6BD4" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: data.categories.income.map((category) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: category.category }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: category.amount.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(category.amount, data.totalIncome), "%"] })] }, category.category))) })] }) }) })] })) : ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", color: "textSecondary", align: "center", sx: { py: 3 }, children: "\u6B64\u671F\u9593\u7121\u6536\u5165\u6578\u64DA" }))] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u652F\u51FA\u5206\u6790" }), ((_b = data.categories) === null || _b === void 0 ? void 0 : _b.expense) && data.categories.expense.length > 0 ? ((0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 240 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Pie, { data: preparePieChartData('expense'), options: {
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: {
                                                                    position: 'right',
                                                                }
                                                            }
                                                        } }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TableContainer, { children: (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u985E\u5225" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u767E\u5206\u6BD4" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: data.categories.expense.map((category) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: category.category }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: category.amount.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [calculatePercentage(category.amount, data.totalExpense), "%"] })] }, category.category))) })] }) }) })] })) : ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", color: "textSecondary", align: "center", sx: { py: 3 }, children: "\u6B64\u671F\u9593\u7121\u652F\u51FA\u6578\u64DA" }))] }) }) }), data.monthlyData && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6708\u5EA6\u8DA8\u52E2\u5206\u6790" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 300 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Line, { data: {
                                                labels: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
                                                datasets: [
                                                    {
                                                        label: '收入',
                                                        data: data.monthlyData.map((monthData) => monthData.income),
                                                        borderColor: 'rgba(75, 192, 192, 1)',
                                                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                                        tension: 0.4
                                                    },
                                                    {
                                                        label: '支出',
                                                        data: data.monthlyData.map((monthData) => monthData.expense),
                                                        borderColor: 'rgba(255, 99, 132, 1)',
                                                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                                        tension: 0.4
                                                    },
                                                    {
                                                        label: '淨額',
                                                        data: data.monthlyData.map((monthData) => monthData.income - monthData.expense),
                                                        borderColor: 'rgba(54, 162, 235, 1)',
                                                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                                        tension: 0.4
                                                    }
                                                ]
                                            }, options: {
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'top',
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true
                                                    }
                                                }
                                            } }) })] }) }) }))] })] }));
};
exports.default = IncomeExpenseReport;
