"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
// 註冊 ChartJS 組件
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
const CashFlowReport = ({ data }) => {
    // 檢查資料是否存在
    if (!data || !data.operatingActivities || !data.investingActivities || !data.financingActivities) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { children: (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "info", children: "\u76EE\u524D\u6C92\u6709\u73FE\u91D1\u6D41\u91CF\u8868\u8CC7\u6599\uFF0C\u8ACB\u5148\u5EFA\u7ACB\u6703\u8A08\u79D1\u76EE\u548C\u5E33\u52D9\u8A18\u9304\u3002" }) }));
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
    // 從 API 資料中整理出前端需要的結構
    const processedData = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        startingCash: 0, // 期初現金，需要從其他地方取得或計算
        operatingActivities: {
            inflows: [],
            outflows: []
        },
        investingActivities: {
            inflows: [],
            outflows: []
        },
        financingActivities: {
            inflows: [],
            outflows: []
        }
    };
    // 處理營業活動
    if (data.operatingActivities && data.operatingActivities.items) {
        data.operatingActivities.items.forEach((item) => {
            const netCashFlow = parseFloat(item.net_cash_flow) || 0;
            if (netCashFlow > 0) {
                processedData.operatingActivities.inflows.push({
                    name: item.account_name,
                    amount: netCashFlow
                });
            }
            else if (netCashFlow < 0) {
                processedData.operatingActivities.outflows.push({
                    name: item.account_name,
                    amount: Math.abs(netCashFlow)
                });
            }
        });
    }
    // 處理投資活動
    if (data.investingActivities && data.investingActivities.items) {
        data.investingActivities.items.forEach((item) => {
            const netCashFlow = parseFloat(item.net_cash_flow) || 0;
            if (netCashFlow > 0) {
                processedData.investingActivities.inflows.push({
                    name: item.account_name,
                    amount: netCashFlow
                });
            }
            else if (netCashFlow < 0) {
                processedData.investingActivities.outflows.push({
                    name: item.account_name,
                    amount: Math.abs(netCashFlow)
                });
            }
        });
    }
    // 處理融資活動
    if (data.financingActivities && data.financingActivities.items) {
        data.financingActivities.items.forEach((item) => {
            const netCashFlow = parseFloat(item.net_cash_flow) || 0;
            if (netCashFlow > 0) {
                processedData.financingActivities.inflows.push({
                    name: item.account_name,
                    amount: netCashFlow
                });
            }
            else if (netCashFlow < 0) {
                processedData.financingActivities.outflows.push({
                    name: item.account_name,
                    amount: Math.abs(netCashFlow)
                });
            }
        });
    }
    // 計算各部分的淨現金流
    const calculateNetCashFlows = () => {
        // 營業活動
        const operatingInflowsTotal = processedData.operatingActivities.inflows.reduce((sum, item) => sum + item.amount, 0);
        const operatingOutflowsTotal = processedData.operatingActivities.outflows.reduce((sum, item) => sum + item.amount, 0);
        const netOperating = operatingInflowsTotal - operatingOutflowsTotal;
        // 投資活動
        const investingInflowsTotal = processedData.investingActivities.inflows.reduce((sum, item) => sum + item.amount, 0);
        const investingOutflowsTotal = processedData.investingActivities.outflows.reduce((sum, item) => sum + item.amount, 0);
        const netInvesting = investingInflowsTotal - investingOutflowsTotal;
        // 融資活動
        const financingInflowsTotal = processedData.financingActivities.inflows.reduce((sum, item) => sum + item.amount, 0);
        const financingOutflowsTotal = processedData.financingActivities.outflows.reduce((sum, item) => sum + item.amount, 0);
        const netFinancing = financingInflowsTotal - financingOutflowsTotal;
        // 淨現金流
        const netCashFlow = netOperating + netInvesting + netFinancing;
        return {
            operatingInflowsTotal,
            operatingOutflowsTotal,
            netOperating,
            investingInflowsTotal,
            investingOutflowsTotal,
            netInvesting,
            financingInflowsTotal,
            financingOutflowsTotal,
            netFinancing,
            netCashFlow
        };
    };
    const { operatingInflowsTotal, operatingOutflowsTotal, netOperating, investingInflowsTotal, investingOutflowsTotal, netInvesting, financingInflowsTotal, financingOutflowsTotal, netFinancing, netCashFlow } = calculateNetCashFlows();
    // 計算期末現金
    const endingCash = processedData.startingCash + netCashFlow;
    // 準備現金流量圖表數據
    const prepareCashFlowChartData = () => {
        return {
            labels: ['營業活動', '投資活動', '融資活動', '淨現金流'],
            datasets: [
                {
                    label: '現金流量',
                    data: [netOperating, netInvesting, netFinancing, netCashFlow],
                    backgroundColor: [
                        netOperating >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
                        netInvesting >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
                        netFinancing >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
                        netCashFlow >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
                    ],
                    borderColor: [
                        netOperating >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
                        netInvesting >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
                        netFinancing >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
                        netCashFlow >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };
    // 準備現金流變化圖表數據
    const prepareCashChangeChartData = () => {
        return {
            labels: ['期初現金', '淨現金流入(出)', '期末現金'],
            datasets: [
                {
                    label: '現金變化',
                    data: [processedData.startingCash, netCashFlow, endingCash],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        netCashFlow >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
                        'rgba(255, 206, 86, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        netCashFlow >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", gutterBottom: true, children: ["\u73FE\u91D1\u6D41\u91CF\u8868 - ", processedData.month ? `${processedData.year}年${processedData.month}月` : `${processedData.year}年度`] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u671F\u521D\u73FE\u91D1" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h5", color: "primary.main", children: [processedData.startingCash.toLocaleString(), " \u5143"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u6DE8\u73FE\u91D1\u6D41\u5165(\u51FA)" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h5", color: netCashFlow >= 0 ? "success.main" : "error.main", children: [netCashFlow.toLocaleString(), " \u5143"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u671F\u672B\u73FE\u91D1" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h5", color: "primary.main", children: [endingCash.toLocaleString(), " \u5143"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: "\u73FE\u91D1\u8B8A\u5316\u7387" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", color: netCashFlow >= 0 ? "success.main" : "error.main", children: processedData.startingCash === 0
                                                ? '-'
                                                : ((netCashFlow / processedData.startingCash) * 100).toFixed(1) + '%' })] })] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u73FE\u91D1\u6D41\u91CF\u5206\u6790" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 300 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Bar, { data: prepareCashFlowChartData(), options: {
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true
                                                    }
                                                }
                                            } }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u73FE\u91D1\u8B8A\u5316\u8DA8\u52E2" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { height: 300 }, children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Bar, { data: prepareCashChangeChartData(), options: {
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true
                                                    }
                                                }
                                            } }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u71DF\u696D\u6D3B\u52D5" }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u73FE\u91D1\u6D41\u5165" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, elevation: 0, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [processedData.operatingActivities.inflows.length > 0 ? (processedData.operatingActivities.inflows.map((item, index) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: item.name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: item.amount.toLocaleString() })] }, index)))) : ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 2, align: "center", children: "\u7121\u73FE\u91D1\u6D41\u5165" }) })), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u71DF\u696D\u6D3B\u52D5\u73FE\u91D1\u6D41\u5165\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: operatingInflowsTotal.toLocaleString() }) })] })] })] }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u73FE\u91D1\u6D41\u51FA" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, elevation: 0, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [processedData.operatingActivities.outflows.length > 0 ? (processedData.operatingActivities.outflows.map((item, index) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: item.name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: item.amount.toLocaleString() })] }, index)))) : ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 2, align: "center", children: "\u7121\u73FE\u91D1\u6D41\u51FA" }) })), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u71DF\u696D\u6D3B\u52D5\u73FE\u91D1\u6D41\u51FA\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: operatingOutflowsTotal.toLocaleString() }) })] })] })] }) })] })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "subtitle1", align: "center", children: ["\u71DF\u696D\u6D3B\u52D5\u6DE8\u73FE\u91D1\u6D41:", (0, jsx_runtime_1.jsxs)("span", { style: {
                                                        color: netOperating >= 0 ? 'green' : 'red',
                                                        fontWeight: 'bold',
                                                        marginLeft: '8px'
                                                    }, children: [netOperating.toLocaleString(), " \u5143"] })] }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6295\u8CC7\u6D3B\u52D5" }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u73FE\u91D1\u6D41\u5165" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, elevation: 0, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [processedData.investingActivities.inflows.length > 0 ? (processedData.investingActivities.inflows.map((item, index) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: item.name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: item.amount.toLocaleString() })] }, index)))) : ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 2, align: "center", children: "\u7121\u73FE\u91D1\u6D41\u5165" }) })), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u6295\u8CC7\u6D3B\u52D5\u73FE\u91D1\u6D41\u5165\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: investingInflowsTotal.toLocaleString() }) })] })] })] }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u73FE\u91D1\u6D41\u51FA" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, elevation: 0, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [processedData.investingActivities.outflows.length > 0 ? (processedData.investingActivities.outflows.map((item, index) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: item.name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: item.amount.toLocaleString() })] }, index)))) : ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 2, align: "center", children: "\u7121\u73FE\u91D1\u6D41\u51FA" }) })), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u6295\u8CC7\u6D3B\u52D5\u73FE\u91D1\u6D41\u51FA\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: investingOutflowsTotal.toLocaleString() }) })] })] })] }) })] })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "subtitle1", align: "center", children: ["\u6295\u8CC7\u6D3B\u52D5\u6DE8\u73FE\u91D1\u6D41:", (0, jsx_runtime_1.jsxs)("span", { style: {
                                                        color: netInvesting >= 0 ? 'green' : 'red',
                                                        fontWeight: 'bold',
                                                        marginLeft: '8px'
                                                    }, children: [netInvesting.toLocaleString(), " \u5143"] })] }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u878D\u8CC7\u6D3B\u52D5" }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u73FE\u91D1\u6D41\u5165" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, elevation: 0, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [processedData.financingActivities.inflows.length > 0 ? (processedData.financingActivities.inflows.map((item, index) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: item.name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: item.amount.toLocaleString() })] }, index)))) : ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 2, align: "center", children: "\u7121\u73FE\u91D1\u6D41\u5165" }) })), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u878D\u8CC7\u6D3B\u52D5\u73FE\u91D1\u6D41\u5165\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: financingInflowsTotal.toLocaleString() }) })] })] })] }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u73FE\u91D1\u6D41\u51FA" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, elevation: 0, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [processedData.financingActivities.outflows.length > 0 ? (processedData.financingActivities.outflows.map((item, index) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: item.name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: item.amount.toLocaleString() })] }, index)))) : ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 2, align: "center", children: "\u7121\u73FE\u91D1\u6D41\u51FA" }) })), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)("strong", { children: "\u878D\u8CC7\u6D3B\u52D5\u73FE\u91D1\u6D41\u51FA\u5408\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: financingOutflowsTotal.toLocaleString() }) })] })] })] }) })] })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "subtitle1", align: "center", children: ["\u878D\u8CC7\u6D3B\u52D5\u6DE8\u73FE\u91D1\u6D41:", (0, jsx_runtime_1.jsxs)("span", { style: {
                                                        color: netFinancing >= 0 ? 'green' : 'red',
                                                        fontWeight: 'bold',
                                                        marginLeft: '8px'
                                                    }, children: [netFinancing.toLocaleString(), " \u5143"] })] }) })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u73FE\u91D1\u6D41\u91CF\u7E3D\u7D50" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, elevation: 0, children: (0, jsx_runtime_1.jsx)(material_1.Table, { children: (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u671F\u521D\u73FE\u91D1\u9918\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: processedData.startingCash.toLocaleString() })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u71DF\u696D\u6D3B\u52D5\u6DE8\u73FE\u91D1\u6D41" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: { color: netOperating >= 0 ? 'success.main' : 'error.main' }, children: netOperating.toLocaleString() })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u6D3B\u52D5\u6DE8\u73FE\u91D1\u6D41" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: { color: netInvesting >= 0 ? 'success.main' : 'error.main' }, children: netInvesting.toLocaleString() })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u878D\u8CC7\u6D3B\u52D5\u6DE8\u73FE\u91D1\u6D41" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: { color: netFinancing >= 0 ? 'success.main' : 'error.main' }, children: netFinancing.toLocaleString() })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u672C\u671F\u6DE8\u73FE\u91D1\u6D41\u5165(\u51FA)" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: {
                                                                    color: netCashFlow >= 0 ? 'success.main' : 'error.main',
                                                                    fontWeight: 'bold'
                                                                }, children: netCashFlow.toLocaleString() })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { sx: { fontWeight: 'bold' }, children: "\u671F\u672B\u73FE\u91D1\u9918\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: { fontWeight: 'bold' }, children: endingCash.toLocaleString() })] })] }) }) })] }) }) })] })] }));
};
exports.default = CashFlowReport;
