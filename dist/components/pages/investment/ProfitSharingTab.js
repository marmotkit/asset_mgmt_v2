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
const ProfitSharingTab = () => {
    const [investments, setInvestments] = (0, react_1.useState)([]);
    const [profitStandards, setProfitStandards] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [selectedStandard, setSelectedStandard] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        investmentId: '',
        type: rental_1.ProfitSharingType.PERCENTAGE,
        value: 0,
        startDate: '',
        endDate: '',
        note: '',
    });
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setLoading(true);
        try {
            const [investmentsData, standardsData] = await Promise.all([
                services_1.ApiService.getInvestments(),
                services_1.ApiService.getProfitSharingStandards(),
            ]);
            setInvestments(investmentsData);
            setProfitStandards(standardsData);
        }
        catch (err) {
            setError('載入資料失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddStandard = () => {
        setSelectedStandard(null);
        setFormData({
            investmentId: '',
            type: rental_1.ProfitSharingType.PERCENTAGE,
            value: 0,
            startDate: '',
            endDate: '',
            note: '',
        });
        setDialogOpen(true);
    };
    const handleEditStandard = (standard) => {
        setSelectedStandard(standard);
        setFormData({
            investmentId: standard.investmentId,
            type: standard.type,
            value: standard.value,
            startDate: standard.startDate,
            endDate: standard.endDate || '',
            note: standard.note || '',
        });
        setDialogOpen(true);
    };
    const handleDeleteStandard = async (id) => {
        if (!window.confirm('確定要刪除此分潤標準？'))
            return;
        setLoading(true);
        try {
            await services_1.ApiService.deleteProfitSharingStandard(id);
            await loadData();
        }
        catch (err) {
            setError('刪除分潤標準失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        if (!formData.investmentId || !formData.type || formData.value === undefined || !formData.startDate) {
            setError('請填寫必要欄位');
            return;
        }
        setLoading(true);
        try {
            if (selectedStandard) {
                await services_1.ApiService.updateProfitSharingStandard(selectedStandard.id, formData);
            }
            else {
                await services_1.ApiService.createProfitSharingStandard(formData);
            }
            await loadData();
            setDialogOpen(false);
        }
        catch (err) {
            setError('儲存分潤標準失敗');
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
    const formatValue = (type, value) => {
        switch (type) {
            case rental_1.ProfitSharingType.PERCENTAGE:
                return `${value}%`;
            case rental_1.ProfitSharingType.FIXED_AMOUNT:
                return `NT$ ${value.toLocaleString()}`;
            default:
                return value.toString();
        }
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {});
    if (error)
        return (0, jsx_runtime_1.jsx)(ErrorAlert_1.default, { message: error });
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u5206\u6F64\u6A19\u6E96\u8A2D\u5B9A" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: handleAddStandard, children: "\u65B0\u589E\u5206\u6F64\u6A19\u6E96" })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5206\u6F64\u65B9\u5F0F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u5206\u6F64\u503C" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u751F\u6548\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7D50\u675F\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5099\u8A3B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [profitStandards.map((standard) => {
                                    const investment = investments.find((inv) => inv.id === standard.investmentId);
                                    return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (investment === null || investment === void 0 ? void 0 : investment.name) || '未知項目' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: standard.type === rental_1.ProfitSharingType.PERCENTAGE ? '百分比' :
                                                    standard.type === rental_1.ProfitSharingType.FIXED_AMOUNT ? '固定金額' : '其他' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: formatValue(standard.type, standard.value) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, format_1.formatDate)(standard.startDate) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: standard.endDate ? (0, format_1.formatDate)(standard.endDate) : '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: standard.note || '-' }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleEditStandard(standard), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => handleDeleteStandard(standard.id), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })] }, standard.id));
                                }), profitStandards.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 7, align: "center", children: "\u5C1A\u7121\u5206\u6F64\u6A19\u6E96\u8CC7\u6599" }) }))] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: selectedStandard ? '編輯分潤標準' : '新增分潤標準' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { select: true, fullWidth: true, label: "\u6295\u8CC7\u9805\u76EE", value: formData.investmentId, onChange: handleInputChange('investmentId'), required: true, children: investments.map((investment) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: investment.id, children: investment.name }, investment.id))) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, required: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u5206\u6F64\u65B9\u5F0F" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.type, label: "\u5206\u6F64\u65B9\u5F0F", onChange: handleSelectChange('type'), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.ProfitSharingType.PERCENTAGE, children: "\u767E\u5206\u6BD4" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.ProfitSharingType.FIXED_AMOUNT, children: "\u56FA\u5B9A\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.ProfitSharingType.OTHER, children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: formData.type === rental_1.ProfitSharingType.PERCENTAGE ? '百分比值' : '金額', type: "number", value: formData.value, onChange: handleInputChange('value'), required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u751F\u6548\u65E5\u671F", type: "date", value: formData.startDate, onChange: handleInputChange('startDate'), required: true, InputLabelProps: { shrink: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7D50\u675F\u65E5\u671F", type: "date", value: formData.endDate, onChange: handleInputChange('endDate'), InputLabelProps: { shrink: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5099\u8A3B", multiline: true, rows: 3, value: formData.note, onChange: handleInputChange('note') }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSave, variant: "contained", children: "\u5132\u5B58" })] })] })] }));
};
exports.default = ProfitSharingTab;
