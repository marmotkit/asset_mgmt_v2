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
const services_1 = require("../../../services");
const format_1 = require("../../../utils/format");
const LoadingSpinner_1 = __importDefault(require("../../common/LoadingSpinner"));
const ErrorAlert_1 = __importDefault(require("../../common/ErrorAlert"));
const notistack_1 = require("notistack");
const MemberProfitTab = ({ investments }) => {
    const [memberProfits, setMemberProfits] = (0, react_1.useState)([]);
    const [availableInvestments, setAvailableInvestments] = (0, react_1.useState)([]);
    const [members, setMembers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [selectedProfit, setSelectedProfit] = (0, react_1.useState)(null);
    const [yearFilter, setYearFilter] = (0, react_1.useState)(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = (0, react_1.useState)(new Date().getMonth() + 1);
    const [showAllYear, setShowAllYear] = (0, react_1.useState)(true); // 預設顯示全年
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    // 排序相關狀態
    const [sortField, setSortField] = (0, react_1.useState)('yearMonth');
    const [sortDirection, setSortDirection] = (0, react_1.useState)('asc');
    const [formData, setFormData] = (0, react_1.useState)({
        investmentId: '',
        memberId: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        amount: 0,
        status: rental_1.PaymentStatus.PENDING,
        paymentMethod: rental_1.PaymentMethod.BANK_TRANSFER,
        paymentDate: '',
        note: '',
    });
    // 新增投資項目選擇相關狀態
    const [selectionDialogOpen, setSelectionDialogOpen] = (0, react_1.useState)(false);
    const [investmentSelections, setInvestmentSelections] = (0, react_1.useState)([]);
    // 添加清除對話框狀態
    const [clearDialogOpen, setClearDialogOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        loadData();
    }, [yearFilter, monthFilter, showAllYear]);
    // 當切換到當年度模式時，自動調整排序方向為升序
    (0, react_1.useEffect)(() => {
        if (showAllYear && sortField === 'yearMonth' && sortDirection === 'desc') {
            setSortDirection('asc');
        }
    }, [showAllYear, sortField, sortDirection]);
    // 排序函數
    const sortProfits = (profits) => {
        return [...profits].sort((a, b) => {
            let aValue;
            let bValue;
            switch (sortField) {
                case 'investmentName':
                    const investmentA = investments.find(inv => inv.id === a.investmentId);
                    const investmentB = investments.find(inv => inv.id === b.investmentId);
                    aValue = (investmentA === null || investmentA === void 0 ? void 0 : investmentA.name) || '';
                    bValue = (investmentB === null || investmentB === void 0 ? void 0 : investmentB.name) || '';
                    break;
                case 'memberName':
                    const memberA = members.find(m => m.id === a.memberId);
                    const memberB = members.find(m => m.id === b.memberId);
                    aValue = (memberA === null || memberA === void 0 ? void 0 : memberA.name) || '';
                    bValue = (memberB === null || memberB === void 0 ? void 0 : memberB.name) || '';
                    break;
                case 'yearMonth':
                    aValue = a.year * 100 + a.month;
                    bValue = b.year * 100 + b.month;
                    break;
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                case 'status':
                    aValue = getStatusText(a.status);
                    bValue = getStatusText(b.status);
                    break;
                case 'paymentMethod':
                    aValue = getPaymentMethodText(a.paymentMethod);
                    bValue = getPaymentMethodText(b.paymentMethod);
                    break;
                case 'paymentDate':
                    aValue = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
                    bValue = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
                    break;
                case 'note':
                    aValue = a.note || '';
                    bValue = b.note || '';
                    break;
                default:
                    return 0;
            }
            // 處理字串比較
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };
    // 處理排序變更
    const handleSort = (field) => {
        const isAsc = sortField === field && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortField(field);
    };
    // 獲取付款方式文字
    const getPaymentMethodText = (method) => {
        switch (method) {
            case rental_1.PaymentMethod.CASH:
                return '現金';
            case rental_1.PaymentMethod.BANK_TRANSFER:
                return '銀行轉帳';
            case rental_1.PaymentMethod.CHECK:
                return '支票';
            case rental_1.PaymentMethod.OTHER:
                return '其他';
            default:
                return '其他';
        }
    };
    // 獲取排序標籤
    const getSortLabel = (field, label) => ((0, jsx_runtime_1.jsx)(material_1.TableSortLabel, { active: sortField === field, direction: sortField === field ? sortDirection : 'asc', onClick: () => handleSort(field), children: label }));
    const loadData = async () => {
        setLoading(true);
        try {
            // 載入有分潤標準的投資項目
            const availableInvestmentsData = await services_1.ApiService.getAvailableInvestmentsForMemberProfits();
            setAvailableInvestments(availableInvestmentsData);
            // 載入會員資料
            const membersData = await services_1.ApiService.getMembers();
            setMembers(membersData);
            // 載入會員分潤資料
            const profitsData = await services_1.ApiService.getMemberProfits(undefined, undefined, yearFilter, showAllYear ? undefined : monthFilter);
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
            const existingProfits = await services_1.ApiService.getMemberProfits(undefined, undefined, yearFilter);
            // 準備有分潤標準的投資項目選擇清單
            const selections = availableInvestments.map(inv => ({
                id: inv.id,
                name: inv.name,
                selected: false,
                hasExistingProfits: existingProfits.some(p => p.investmentId === inv.id)
            }));
            setInvestmentSelections(selections);
            setSelectionDialogOpen(true);
        }
        catch (err) {
            enqueueSnackbar('生成會員分潤項目失敗', { variant: 'error' });
        }
    };
    const handleGenerateConfirm = async () => {
        setSelectionDialogOpen(false);
        setLoading(true);
        let hasError = false;
        let errorMessage = '';
        try {
            // 取得選擇的投資項目
            const selectedInvestments = investmentSelections.filter(inv => inv.selected);
            // 依序處理每個選擇的投資項目
            for (const inv of selectedInvestments) {
                try {
                    await services_1.ApiService.generateMemberProfits(inv.id, yearFilter);
                }
                catch (error) {
                    hasError = true;
                    errorMessage += `${inv.name}: ${error instanceof Error ? error.message : '生成失敗'}\n`;
                }
            }
            if (hasError) {
                enqueueSnackbar(errorMessage, { variant: 'warning' });
            }
            else {
                enqueueSnackbar('會員分潤項目生成完成', { variant: 'success' });
            }
            await loadData();
        }
        catch (error) {
            enqueueSnackbar('生成會員分潤項目時發生錯誤', { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    const handleEditProfit = (profit) => {
        setSelectedProfit(profit);
        setFormData({
            ...profit,
            paymentMethod: profit.paymentMethod || rental_1.PaymentMethod.BANK_TRANSFER,
            paymentDate: profit.paymentDate || '',
            note: profit.note || ''
        });
        setDialogOpen(true);
    };
    const handleSave = async () => {
        if (!selectedProfit)
            return;
        try {
            await services_1.ApiService.updateMemberProfit(selectedProfit.id, formData);
            enqueueSnackbar('會員分潤項目更新成功', { variant: 'success' });
            setDialogOpen(false);
            await loadData();
        }
        catch (error) {
            enqueueSnackbar('更新會員分潤項目失敗', { variant: 'error' });
        }
    };
    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };
    const handleSelectChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };
    const getStatusColor = (status) => {
        switch (status) {
            case rental_1.PaymentStatus.PENDING:
                return 'warning';
            case rental_1.PaymentStatus.PAID:
                return 'success';
            case rental_1.PaymentStatus.OVERDUE:
                return 'error';
            default:
                return 'default';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case rental_1.PaymentStatus.PENDING:
                return '待發放';
            case rental_1.PaymentStatus.PAID:
                return '已發放';
            case rental_1.PaymentStatus.OVERDUE:
                return '逾期';
            default:
                return '未知';
        }
    };
    const handleDeleteClick = (profit) => {
        if (window.confirm('確定要刪除此會員分潤項目嗎？')) {
            handleDeleteConfirm(profit);
        }
    };
    const handleDeleteConfirm = async (profit) => {
        try {
            await services_1.ApiService.deleteMemberProfit(profit.id);
            enqueueSnackbar('會員分潤項目刪除成功', { variant: 'success' });
            await loadData();
        }
        catch (error) {
            enqueueSnackbar('刪除會員分潤項目失敗', { variant: 'error' });
        }
    };
    const handleSelectionChange = (investmentId) => {
        setInvestmentSelections(prev => prev.map(inv => inv.id === investmentId
            ? { ...inv, selected: !inv.selected }
            : inv));
    };
    // 添加清除分潤項目的處理函數
    const handleClearProfits = () => {
        setClearDialogOpen(true);
    };
    // 確認清除分潤項目
    const handleClearConfirm = async () => {
        try {
            await services_1.ApiService.clearMemberProfits(yearFilter);
            enqueueSnackbar(`已清除 ${yearFilter}年${showAllYear ? '' : monthFilter + '月'}的分潤項目`, { variant: 'success' });
            await loadData();
        }
        catch (err) {
            enqueueSnackbar('清除分潤項目失敗', { variant: 'error' });
        }
        finally {
            setClearDialogOpen(false);
        }
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {});
    if (error)
        return (0, jsx_runtime_1.jsx)(ErrorAlert_1.default, { message: error });
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u6703\u54E1\u5206\u6F64\u7BA1\u7406" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { mr: 2, minWidth: 100 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "year-filter-label", htmlFor: "year-filter", children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "year-filter-label", id: "year-filter", name: "year-filter", value: yearFilter.toString(), label: "\u5E74\u5EA6", onChange: (e) => setYearFilter(Number(e.target.value)), inputProps: {
                                            'aria-labelledby': 'year-filter-label'
                                        }, children: Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: year, id: `year-option-${year}`, children: year }, year))) })] }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { mr: 2, minWidth: 100 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "month-filter-label", htmlFor: "month-filter", children: "\u6708\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "month-filter-label", id: "month-filter", name: "month-filter", value: monthFilter.toString(), label: "\u6708\u4EFD", onChange: (e) => setMonthFilter(Number(e.target.value)), disabled: showAllYear, inputProps: {
                                            'aria-labelledby': 'month-filter-label'
                                        }, children: Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: month, id: `month-option-${month}`, children: month }, month))) })] }), (0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { control: (0, jsx_runtime_1.jsx)(material_1.Checkbox, { checked: showAllYear, onChange: (e) => {
                                        setShowAllYear(e.target.checked);
                                        if (e.target.checked) {
                                            setMonthFilter(new Date().getMonth() + 1);
                                            // 當勾選當年度時，自動調整為年月升序排序
                                            if (sortField === 'yearMonth' && sortDirection === 'desc') {
                                                setSortDirection('asc');
                                            }
                                        }
                                    } }), label: "\u7576\u5E74\u5EA6", sx: { mr: 2 } }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Refresh, {}), onClick: handleGenerateClick, sx: { mr: 1 }, "aria-label": "\u751F\u6210\u5206\u6F64\u9805\u76EE", children: "\u751F\u6210\u5206\u6F64\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", color: "error", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}), onClick: handleClearProfits, children: "\u6E05\u9664\u5206\u6F64\u9805\u76EE" })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('investmentName', '投資項目') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('memberName', '會員') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('yearMonth', '年月') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: getSortLabel('amount', '分潤金額') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('status', '發放狀態') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('paymentMethod', '發放方式') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('paymentDate', '發放日期') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('note', '備註') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [sortProfits(memberProfits).map((profit) => {
                                    const investment = investments.find((inv) => inv.id === profit.investmentId);
                                    const member = members.find((m) => m.id === profit.memberId);
                                    return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (investment === null || investment === void 0 ? void 0 : investment.name) || '未知項目' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (member === null || member === void 0 ? void 0 : member.name) || '未知會員' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: `${profit.year}年${profit.month}月` }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(profit.amount) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusText(profit.status), color: getStatusColor(profit.status), size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: profit.paymentMethod ? (profit.paymentMethod === rental_1.PaymentMethod.CASH ? '現金' :
                                                    profit.paymentMethod === rental_1.PaymentMethod.BANK_TRANSFER ? '銀行轉帳' :
                                                        profit.paymentMethod === rental_1.PaymentMethod.CHECK ? '支票' : '其他') : '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: profit.paymentDate ? (0, format_1.formatDate)(profit.paymentDate) : '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: profit.note || '-' }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleEditProfit(profit), "aria-label": `編輯 ${(investment === null || investment === void 0 ? void 0 : investment.name) || '未知項目'} ${profit.year}年${profit.month}月 的分潤項目`, children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleDeleteClick(profit), color: "error", "aria-label": `刪除 ${(investment === null || investment === void 0 ? void 0 : investment.name) || '未知項目'} ${profit.year}年${profit.month}月 的分潤項目`, children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })] }, profit.id));
                                }), memberProfits.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 9, align: "center", children: "\u5C1A\u7121\u6703\u54E1\u5206\u6F64\u8CC7\u6599" }) }))] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, "aria-labelledby": "edit-member-profit-title", disableEnforceFocus: true, keepMounted: false, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { id: "edit-member-profit-title", children: "\u7DE8\u8F2F\u6703\u54E1\u5206\u6F64\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { select: true, fullWidth: true, label: "\u6295\u8CC7\u9805\u76EE", value: formData.investmentId, onChange: handleInputChange('investmentId'), required: true, disabled: true, children: investments.map((investment) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: investment.id, children: investment.name }, investment.id))) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { select: true, fullWidth: true, label: "\u6703\u54E1", value: formData.memberId, onChange: handleInputChange('memberId'), required: true, disabled: true, children: members.map((member) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: member.id, children: member.name }, member.id))) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5E74\u5EA6", value: formData.year, disabled: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6708\u4EFD", value: formData.month, disabled: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5206\u6F64\u91D1\u984D", type: "number", value: formData.amount, onChange: handleInputChange('amount'), required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, required: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u767C\u653E\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.status, label: "\u767C\u653E\u72C0\u614B", onChange: handleSelectChange('status'), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentStatus.PENDING, children: "\u5F85\u767C\u653E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentStatus.PAID, children: "\u5DF2\u767C\u653E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentStatus.OVERDUE, children: "\u903E\u671F" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u767C\u653E\u65B9\u5F0F" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.paymentMethod, label: "\u767C\u653E\u65B9\u5F0F", onChange: handleSelectChange('paymentMethod'), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.CASH, children: "\u73FE\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.BANK_TRANSFER, children: "\u9280\u884C\u8F49\u5E33" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.CHECK, children: "\u652F\u7968" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.OTHER, children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u767C\u653E\u65E5\u671F", type: "date", value: formData.paymentDate, onChange: handleInputChange('paymentDate'), InputLabelProps: {
                                            shrink: true,
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5099\u8A3B", value: formData.note, onChange: handleInputChange('note'), multiline: true, rows: 3 }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSave, variant: "contained", children: "\u5132\u5B58" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: selectionDialogOpen, onClose: () => setSelectionDialogOpen(false), maxWidth: "md", fullWidth: true, "aria-labelledby": "investment-selection-title", children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { id: "investment-selection-title", children: "\u9078\u64C7\u8981\u751F\u6210\u5206\u6F64\u9805\u76EE\u7684\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.DialogContentText, { sx: { mb: 2 }, children: ["\u8ACB\u9078\u64C7\u8981\u70BA ", yearFilter, " \u5E74\u751F\u6210\u6703\u54E1\u5206\u6F64\u9805\u76EE\u7684\u6295\u8CC7\u9805\u76EE\uFF1A"] }), (0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 2, children: investmentSelections.map((investment) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { control: (0, jsx_runtime_1.jsx)(material_1.Checkbox, { checked: investment.selected, onChange: () => handleSelectionChange(investment.id), disabled: investment.hasExistingProfits }), label: (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: investment.name }), investment.hasExistingProfits && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", color: "warning.main", children: "\u5DF2\u5B58\u5728\u5206\u6F64\u9805\u76EE" }))] }) }) }, investment.id))) })] }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setSelectionDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleGenerateConfirm, variant: "contained", disabled: !investmentSelections.some(inv => inv.selected), children: "\u751F\u6210\u5206\u6F64\u9805\u76EE" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: clearDialogOpen, onClose: () => setClearDialogOpen(false), "aria-labelledby": "clear-confirmation-title", children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { id: "clear-confirmation-title", children: "\u78BA\u8A8D\u6E05\u9664\u5206\u6F64\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.DialogContentText, { children: ["\u78BA\u5B9A\u8981\u6E05\u9664 ", yearFilter, "\u5E74", showAllYear ? '' : monthFilter + '月', " \u7684\u6240\u6709\u6703\u54E1\u5206\u6F64\u9805\u76EE\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002"] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setClearDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClearConfirm, color: "error", variant: "contained", children: "\u78BA\u8A8D\u6E05\u9664" })] })] })] }));
};
exports.default = MemberProfitTab;
