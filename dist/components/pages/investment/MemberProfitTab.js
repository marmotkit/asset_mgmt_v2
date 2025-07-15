"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const rental_1 = require("../../../types/rental");
const api_service_1 = require("../../../services/api.service");
const format_1 = require("../../../utils/format");
const LoadingSpinner_1 = __importDefault(require("../../common/LoadingSpinner"));
const ErrorAlert_1 = __importDefault(require("../../common/ErrorAlert"));
const react_router_dom_1 = require("react-router-dom");
const notistack_1 = require("notistack");
const MemberProfitTab = ({ investments }) => {
    const { id: investmentId } = (0, react_router_dom_1.useParams)();
    const [members, setMembers] = (0, react_1.useState)([]);
    const [memberProfits, setMemberProfits] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [selectedProfit, setSelectedProfit] = (0, react_1.useState)(null);
    const [yearFilter, setYearFilter] = (0, react_1.useState)(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = (0, react_1.useState)(new Date().getMonth() + 1);
    const [formData, setFormData] = (0, react_1.useState)({
        investmentId: '',
        memberId: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        amount: 0,
        status: rental_1.PaymentStatus.PENDING,
        paymentDate: '',
        note: '',
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = (0, react_1.useState)(false);
    const [profitToDelete, setProfitToDelete] = (0, react_1.useState)(null);
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    // 新增投資項目選擇相關狀態
    const [selectionDialogOpen, setSelectionDialogOpen] = (0, react_1.useState)(false);
    const [investmentSelections, setInvestmentSelections] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        loadData();
    }, [yearFilter, monthFilter]);
    const loadData = async () => {
        setLoading(true);
        try {
            const [membersData, profitsData] = await Promise.all([
                api_service_1.ApiService.getMembers(),
                api_service_1.ApiService.getMemberProfits(undefined, undefined, yearFilter, monthFilter),
            ]);
            setMembers(membersData);
            setMemberProfits(profitsData);
        }
        catch (err) {
            setError('載入資料失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleGenerateClick = async () => {
        // 檢查是否有選擇年度
        if (!yearFilter) {
            enqueueSnackbar('請選擇要生成的年度', { variant: 'error' });
            return;
        }
        try {
            // 載入最新的分潤資料以檢查重複
            const existingProfits = await api_service_1.ApiService.getMemberProfits(undefined, undefined, yearFilter);
            // 獲取有租賃標準和分潤標準的投資項目
            const availableInvestments = await api_service_1.ApiService.getAvailableInvestmentsForMemberProfits();
            if (availableInvestments.length === 0) {
                enqueueSnackbar('沒有可用的投資項目。請確保投資項目已設定租賃標準和分潤標準。', { variant: 'warning' });
                return;
            }
            // 準備投資項目選擇清單
            const selections = availableInvestments.map(inv => ({
                id: inv.id,
                name: inv.name,
                selected: false,
                hasExistingProfits: existingProfits.some(p => p.investmentId === inv.id)
            }));
            setInvestmentSelections(selections);
            setSelectionDialogOpen(true);
        }
        catch (error) {
            enqueueSnackbar('準備生成資料時發生錯誤', { variant: 'error' });
        }
    };
    const handleGenerateConfirm = async () => {
        setSelectionDialogOpen(false);
        setLoading(true);
        let hasError = false;
        let errorMessage = '';
        console.log('開始生成會員分潤項目...');
        try {
            // 取得選擇的投資項目
            const selectedInvestments = investmentSelections.filter(inv => inv.selected);
            console.log(`選擇了 ${selectedInvestments.length} 個投資項目進行分潤生成`);
            if (selectedInvestments.length === 0) {
                enqueueSnackbar('請選擇至少一個投資項目進行分潤生成', { variant: 'warning' });
                setLoading(false);
                return;
            }
            // 依序處理每個選擇的投資項目
            for (const inv of selectedInvestments) {
                try {
                    console.log(`正在為投資項目 ${inv.name}(${inv.id}) 生成分潤...`);
                    await api_service_1.ApiService.generateMemberProfits(inv.id, yearFilter);
                    console.log(`投資項目 ${inv.name} 分潤生成成功`);
                }
                catch (error) {
                    hasError = true;
                    const errMsg = error instanceof Error ? error.message : '生成失敗';
                    errorMessage += `${inv.name}: ${errMsg}\n`;
                    console.error(`投資項目 ${inv.name} 分潤生成失敗:`, error);
                    // 檢查是否是會員不存在的問題
                    if (errMsg.includes('找不到所屬會員')) {
                        // 提示用戶需要檢查投資項目與會員的關聯
                        enqueueSnackbar(`投資項目 ${inv.name} 的所屬會員不存在或未設定，請先更新投資項目的會員關聯`, { variant: 'error', autoHideDuration: 6000 });
                    }
                }
            }
            if (hasError) {
                console.warn('部分投資項目生成失敗:', errorMessage);
                enqueueSnackbar('部分投資項目生成失敗:\n' + errorMessage, {
                    variant: 'warning',
                    autoHideDuration: 8000
                });
            }
            else {
                console.log('所有投資項目分潤生成完成');
                enqueueSnackbar('會員分潤項目生成完成', { variant: 'success' });
            }
            console.log('重新載入分潤資料...');
            await loadData();
            console.log('資料重新載入完成');
            // 移除強制跳轉，讓頁面保持在當前狀態
            console.log('分潤生成完成，頁面保持在當前狀態');
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : '未知錯誤';
            console.error('生成會員分潤項目時發生錯誤:', errorMsg);
            enqueueSnackbar(`生成會員分潤項目時發生錯誤: ${errorMsg}`, { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    const handleEditProfit = (profit) => {
        setSelectedProfit(profit);
        setFormData({
            investmentId: profit.investmentId,
            memberId: profit.memberId,
            year: profit.year,
            month: profit.month,
            amount: profit.amount,
            status: profit.status,
            paymentDate: profit.paymentDate || '',
            note: profit.note || '',
        });
        setDialogOpen(true);
    };
    const handleSave = async () => {
        if (!formData.investmentId || !formData.memberId || !formData.amount || !formData.status) {
            setError('請填寫必要欄位');
            return;
        }
        setLoading(true);
        try {
            if (selectedProfit) {
                await api_service_1.ApiService.updateMemberProfit(selectedProfit.id, formData);
            }
            await loadData();
            setDialogOpen(false);
        }
        catch (err) {
            setError('儲存會員分潤項目失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleInputChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        });
    };
    const handleSelectChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        });
    };
    const getStatusColor = (status) => {
        switch (status) {
            case rental_1.PaymentStatus.PAID:
                return 'success';
            case rental_1.PaymentStatus.PENDING:
                return 'warning';
            case rental_1.PaymentStatus.OVERDUE:
                return 'error';
            default:
                return 'default';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case rental_1.PaymentStatus.PAID:
                return '已發放';
            case rental_1.PaymentStatus.PENDING:
                return '待發放';
            case rental_1.PaymentStatus.OVERDUE:
                return '逾期';
            default:
                return '未知';
        }
    };
    const handleDeleteClick = (profit) => {
        setProfitToDelete(profit);
        setDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (!profitToDelete)
            return;
        try {
            await api_service_1.ApiService.deleteMemberProfit(profitToDelete.id);
            enqueueSnackbar('分潤項目已刪除', { variant: 'success' });
            await loadData();
        }
        catch (error) {
            enqueueSnackbar('刪除分潤項目失敗', { variant: 'error' });
        }
        finally {
            setDeleteDialogOpen(false);
            setProfitToDelete(null);
        }
    };
    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setProfitToDelete(null);
    };
    const handleSelectionChange = (investmentId) => {
        setInvestmentSelections(prev => prev.map(inv => inv.id === investmentId
            ? { ...inv, selected: !inv.selected }
            : inv));
    };
    const handleClearProfits = async () => {
        if (window.confirm('確定要清除所有會員分潤項目嗎？這將刪除所有已生成的分潤項目。')) {
            setLoading(true);
            try {
                await api_service_1.ApiService.clearMemberProfits();
                enqueueSnackbar('已清除所有會員分潤項目', { variant: 'success' });
                await loadData();
            }
            catch (error) {
                enqueueSnackbar('清除會員分潤項目失敗', { variant: 'error' });
            }
            finally {
                setLoading(false);
            }
        }
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {});
    if (error)
        return (0, jsx_runtime_1.jsx)(ErrorAlert_1.default, { message: error });
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u6703\u54E1\u5206\u6F64\u7BA1\u7406" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { mr: 2, minWidth: 100 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: yearFilter.toString(), label: "\u5E74\u5EA6", onChange: (e) => setYearFilter(Number(e.target.value)), children: Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: year, children: year }, year))) })] }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { mr: 2, minWidth: 100 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6708\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: monthFilter.toString(), label: "\u6708\u4EFD", onChange: (e) => setMonthFilter(Number(e.target.value)), children: Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: month, children: month }, month))) })] }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Refresh, {}), onClick: handleGenerateClick, sx: { mr: 1 }, children: "\u751F\u6210\u5206\u6F64\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", color: "error", onClick: handleClearProfits, sx: { mr: 1 }, children: "\u6E05\u9664\u5206\u6F64\u9805\u76EE" })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5E74\u6708" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u5206\u6F64\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u767C\u653E\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u767C\u653E\u65B9\u5F0F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u767C\u653E\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5099\u8A3B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [memberProfits.map((profit) => {
                                    const investment = investments.find((inv) => inv.id === profit.investmentId);
                                    const member = members.find((m) => m.id === profit.memberId);
                                    return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (investment === null || investment === void 0 ? void 0 : investment.name) || '未知項目' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (member === null || member === void 0 ? void 0 : member.name) || '未知會員' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: `${profit.year}年${profit.month}月` }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(profit.amount) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusText(profit.status), color: getStatusColor(profit.status), size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: profit.paymentMethod ? (profit.paymentMethod === rental_1.PaymentMethod.CASH ? '現金' :
                                                    profit.paymentMethod === rental_1.PaymentMethod.BANK_TRANSFER ? '銀行轉帳' :
                                                        profit.paymentMethod === rental_1.PaymentMethod.CHECK ? '支票' : '其他') : '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: profit.paymentDate ? (0, format_1.formatDate)(profit.paymentDate) : '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: profit.note || '-' }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleEditProfit(profit), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleDeleteClick(profit), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })] }, profit.id));
                                }), memberProfits.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 9, align: "center", children: "\u5C1A\u7121\u6703\u54E1\u5206\u6F64\u8CC7\u6599" }) }))] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u7DE8\u8F2F\u6703\u54E1\u5206\u6F64\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { select: true, fullWidth: true, label: "\u6295\u8CC7\u9805\u76EE", value: formData.investmentId, onChange: handleInputChange('investmentId'), required: true, disabled: true, children: investments.map((investment) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: investment.id, children: investment.name }, investment.id))) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { select: true, fullWidth: true, label: "\u6703\u54E1", value: formData.memberId, onChange: handleInputChange('memberId'), required: true, disabled: true, children: members.map((member) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: member.id, children: member.name }, member.id))) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5E74\u5EA6", value: formData.year, disabled: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6708\u4EFD", value: formData.month, disabled: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5206\u6F64\u91D1\u984D", type: "number", value: formData.amount, onChange: handleInputChange('amount'), required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, required: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u767C\u653E\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.status, label: "\u767C\u653E\u72C0\u614B", onChange: handleSelectChange('status'), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentStatus.PENDING, children: "\u5F85\u767C\u653E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentStatus.PAID, children: "\u5DF2\u767C\u653E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentStatus.OVERDUE, children: "\u903E\u671F" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u767C\u653E\u65B9\u5F0F" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.paymentMethod, label: "\u767C\u653E\u65B9\u5F0F", onChange: handleSelectChange('paymentMethod'), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.CASH, children: "\u73FE\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.BANK_TRANSFER, children: "\u9280\u884C\u8F49\u5E33" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.CHECK, children: "\u652F\u7968" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.OTHER, children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u767C\u653E\u65E5\u671F", type: "date", value: formData.paymentDate, onChange: handleInputChange('paymentDate'), InputLabelProps: { shrink: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5099\u8A3B", multiline: true, rows: 3, value: formData.note, onChange: handleInputChange('note') }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSave, variant: "contained", children: "\u5132\u5B58" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: deleteDialogOpen, onClose: handleDeleteCancel, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: "\u78BA\u5B9A\u8981\u522A\u9664\u9019\u500B\u5206\u6F64\u9805\u76EE\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002" }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteCancel, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteConfirm, color: "error", children: "\u522A\u9664" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: selectionDialogOpen, onClose: () => setSelectionDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u9078\u64C7\u8981\u751F\u6210\u5206\u6F64\u9805\u76EE\u7684\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: investmentSelections.map((inv) => ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { control: (0, jsx_runtime_1.jsx)(material_1.Checkbox, { checked: inv.selected, onChange: () => handleSelectionChange(inv.id), disabled: inv.hasExistingProfits }), label: inv.name }), inv.hasExistingProfits && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", color: "error", children: "\uFF08\u5DF2\u5B58\u5728\u5206\u6F64\u9805\u76EE\uFF09" }))] }, inv.id))) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setSelectionDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleGenerateConfirm, variant: "contained", disabled: !investmentSelections.some(inv => inv.selected), children: "\u751F\u6210" })] })] })] }));
};
exports.default = MemberProfitTab;
