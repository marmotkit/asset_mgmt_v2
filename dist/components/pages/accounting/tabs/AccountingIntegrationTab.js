"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const accountingIntegration_service_1 = require("../../../../services/accountingIntegration.service");
const AccountingIntegrationTab = () => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [syncResults, setSyncResults] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(null);
    // 執行完整同步
    const handleFullSync = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const results = await accountingIntegration_service_1.accountingIntegrationService.syncAllAccountingData();
            setSyncResults({
                feeReceivables: results.feeReceivables.length,
                rentalReceivables: results.rentalReceivables.length,
                profitPayables: results.profitPayables.length
            });
            setSuccess('會計資料同步完成！');
        }
        catch (err) {
            setError('同步失敗，請檢查系統狀態');
            console.error('同步失敗:', err);
        }
        finally {
            setLoading(false);
        }
    };
    // 執行會費同步
    const handleFeeSync = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const results = await accountingIntegration_service_1.accountingIntegrationService.syncFeeReceivables();
            setSyncResults(prev => ({
                ...prev,
                feeReceivables: results.length
            }));
            setSuccess(`會費應收帳款同步完成！共同步 ${results.length} 筆資料`);
        }
        catch (err) {
            setError('會費同步失敗');
            console.error('會費同步失敗:', err);
        }
        finally {
            setLoading(false);
        }
    };
    // 執行租金同步
    const handleRentalSync = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const results = await accountingIntegration_service_1.accountingIntegrationService.syncRentalReceivables();
            setSyncResults(prev => ({
                ...prev,
                rentalReceivables: results.length
            }));
            setSuccess(`租金應收帳款同步完成！共同步 ${results.length} 筆資料`);
        }
        catch (err) {
            setError('租金同步失敗');
            console.error('租金同步失敗:', err);
        }
        finally {
            setLoading(false);
        }
    };
    // 執行分潤同步
    const handleProfitSync = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const results = await accountingIntegration_service_1.accountingIntegrationService.syncMemberProfitPayables();
            setSyncResults(prev => ({
                ...prev,
                profitPayables: results.length
            }));
            setSuccess(`會員分潤應付帳款同步完成！共同步 ${results.length} 筆資料`);
        }
        catch (err) {
            setError('分潤同步失敗');
            console.error('分潤同步失敗:', err);
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", gutterBottom: true, children: "\u6703\u8A08\u8CC7\u6599\u6574\u5408\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "info", sx: { mb: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: "\u6B64\u529F\u80FD\u7528\u65BC\u540C\u6B65\u5404\u6A21\u7D44\u7684\u6703\u8A08\u8CC7\u6599\uFF0C\u78BA\u4FDD\u6703\u8A08\u7CFB\u7D71\u8207\u5176\u4ED6\u6A21\u7D44\u7684\u8CC7\u6599\u4E00\u81F4\u6027\u3002 \u5EFA\u8B70\u5728\u57F7\u884C\u6708\u7D50\u524D\u5148\u57F7\u884C\u540C\u6B65\u4F5C\u696D\u3002" }) }), syncResults && ((0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 2, mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6700\u8FD1\u540C\u6B65\u7D50\u679C" }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.Chip, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.Receipt, {}), label: `會費應收帳款: ${syncResults.feeReceivables} 筆`, color: "primary", variant: "outlined" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.Chip, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.Payment, {}), label: `租金應收帳款: ${syncResults.rentalReceivables} 筆`, color: "secondary", variant: "outlined" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.Chip, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.AccountBalance, {}), label: `分潤應付帳款: ${syncResults.profitPayables} 筆`, color: "success", variant: "outlined" }) })] })] })), error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 3 }, onClose: () => setError(null), children: error })), success && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "success", sx: { mb: 3 }, onClose: () => setSuccess(null), children: success })), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.Card, { children: [(0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u5B8C\u6574\u8CC7\u6599\u540C\u6B65" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", sx: { mb: 2 }, children: "\u540C\u6B65\u6240\u6709\u6A21\u7D44\u7684\u6703\u8A08\u8CC7\u6599\uFF0C\u5305\u62EC\u6703\u8CBB\u3001\u79DF\u91D1\u548C\u5206\u6F64\u9805\u76EE" }), (0, jsx_runtime_1.jsxs)(material_1.List, { dense: true, children: [(0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.CheckCircle, { color: "primary" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u6703\u8CBB\u7BA1\u7406 \u2192 \u61C9\u6536\u5E33\u6B3E" })] }), (0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.CheckCircle, { color: "primary" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u79DF\u91D1\u6536\u6B3E \u2192 \u61C9\u6536\u5E33\u6B3E" })] }), (0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.CheckCircle, { color: "primary" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u6703\u54E1\u5206\u6F64 \u2192 \u61C9\u4ED8\u5E33\u6B3E" })] })] })] }), (0, jsx_runtime_1.jsx)(material_1.CardActions, { children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: loading ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20 }) : (0, jsx_runtime_1.jsx)(icons_material_1.Sync, {}), onClick: handleFullSync, disabled: loading, fullWidth: true, children: loading ? '同步中...' : '執行完整同步' }) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.Card, { children: [(0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u500B\u5225\u6A21\u7D44\u540C\u6B65" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", sx: { mb: 2 }, children: "\u9078\u64C7\u7279\u5B9A\u6A21\u7D44\u9032\u884C\u540C\u6B65" })] }), (0, jsx_runtime_1.jsxs)(material_1.CardActions, { sx: { flexDirection: 'column', alignItems: 'stretch' }, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: loading ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20 }) : (0, jsx_runtime_1.jsx)(icons_material_1.Receipt, {}), onClick: handleFeeSync, disabled: loading, sx: { mb: 1 }, children: loading ? '同步中...' : '同步會費應收帳款' }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: loading ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20 }) : (0, jsx_runtime_1.jsx)(icons_material_1.Payment, {}), onClick: handleRentalSync, disabled: loading, sx: { mb: 1 }, children: loading ? '同步中...' : '同步租金應收帳款' }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: loading ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20 }) : (0, jsx_runtime_1.jsx)(icons_material_1.AccountBalance, {}), onClick: handleProfitSync, disabled: loading, children: loading ? '同步中...' : '同步分潤應付帳款' })] })] }) })] }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { my: 3 } }), (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u7A0B\u5F0F\u908F\u8F2F\u8AAA\u660E" }), (0, jsx_runtime_1.jsxs)(material_1.List, { children: [(0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.Info, { color: "primary" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u65E5\u8A18\u5E33", secondary: "\u7531\u8CA1\u653F\u8005\u81EA\u884C\u8F38\u5165\uFF0C\u6708\u7D50\u6642\u7CFB\u7D71\u81EA\u52D5\u8A08\u7B97\u6536\u652F" })] }), (0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.Info, { color: "primary" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u61C9\u6536\u5E33\u6B3E", secondary: "1) \u624B\u52D5\u65B0\u589E 2) \u6703\u8CBB\u7BA1\u7406\u5F85\u6536\u5E36\u5165 3) \u79DF\u91D1\u6536\u6B3E\u5F85\u6536\u5E36\u5165" })] }), (0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.Info, { color: "primary" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u61C9\u4ED8\u5E33\u6B3E", secondary: "1) \u624B\u52D5\u65B0\u589E 2) \u6703\u54E1\u5206\u6F64\u5F85\u4ED8\u5E36\u5165" })] }), (0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.Info, { color: "primary" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u6708\u7D50\u529F\u80FD", secondary: "\u7D50\u7B97\u65E5\u8A18\u5E33\u3001\u61C9\u6536\u5E33\u6B3E\u3001\u61C9\u4ED8\u5E33\u6B3E" })] }), (0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.Info, { color: "primary" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u8CA1\u52D9\u5831\u8868", secondary: "\u4F9D\u64DA\u6240\u6709\u9805\u76EE\u7D50\u7B97" })] })] })] })] }));
};
exports.default = AccountingIntegrationTab;
