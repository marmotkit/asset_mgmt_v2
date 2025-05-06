"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const services_1 = require("../../../services");
const LoadingSpinner_1 = __importDefault(require("../../common/LoadingSpinner"));
const ErrorAlert_1 = __importDefault(require("../../common/ErrorAlert"));
const CompanyDetailDialog_1 = __importDefault(require("./CompanyDetailDialog"));
const CompanyManagement = () => {
    const [companies, setCompanies] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [selectedCompany, setSelectedCompany] = (0, react_1.useState)(null);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        loadCompanies();
    }, []);
    const loadCompanies = async () => {
        setLoading(true);
        try {
            const data = await services_1.ApiService.getCompanies();
            setCompanies(data);
        }
        catch (err) {
            setError('載入公司資料失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddCompany = () => {
        setSelectedCompany(null);
        setDialogOpen(true);
    };
    const handleEditCompany = (company) => {
        setSelectedCompany(company);
        setDialogOpen(true);
    };
    const handleDeleteCompany = async (id) => {
        if (!window.confirm('確定要刪除此公司資料？'))
            return;
        setLoading(true);
        try {
            await services_1.ApiService.deleteCompany(id);
            await loadCompanies();
        }
        catch (err) {
            setError('刪除公司失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSaveCompany = async (companyData) => {
        setLoading(true);
        try {
            if (companyData.id) {
                await services_1.ApiService.updateCompany(companyData.id, companyData);
            }
            else {
                await services_1.ApiService.createCompany(companyData);
            }
            await loadCompanies();
            setDialogOpen(false);
        }
        catch (error) {
            setError('儲存公司資料失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const filteredCompanies = companies.filter(company => {
        var _a, _b;
        if (!searchQuery)
            return true;
        const searchLower = searchQuery.toLowerCase();
        return (company.companyNo.toLowerCase().includes(searchLower) ||
            company.name.toLowerCase().includes(searchLower) ||
            ((_a = company.nameEn) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchLower)) ||
            company.taxId.toLowerCase().includes(searchLower) ||
            company.address.toLowerCase().includes(searchLower) ||
            ((_b = company.fax) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchLower)) ||
            company.contact.name.toLowerCase().includes(searchLower) ||
            company.contact.email.toLowerCase().includes(searchLower) ||
            company.contact.phone.toLowerCase().includes(searchLower));
    });
    if (loading)
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {});
    if (error)
        return (0, jsx_runtime_1.jsx)(ErrorAlert_1.default, { message: error });
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Toolbar, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", component: "div", sx: { flexGrow: 1 }, children: "\u516C\u53F8\u8CC7\u8A0A\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.TextField, { size: "small", placeholder: "\u641C\u5C0B\u516C\u53F8...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), sx: { mr: 2, width: 300 }, InputProps: {
                            startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Search, {}) })),
                            endAdornment: searchQuery && ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "end", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => setSearchQuery(''), children: (0, jsx_runtime_1.jsx)(icons_material_1.Clear, {}) }) })),
                        } }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: handleAddCompany, children: "\u65B0\u589E\u516C\u53F8" })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u516C\u53F8\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7D71\u4E00\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u516C\u53F8\u540D\u7A31" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u82F1\u6587\u7C21\u7A31" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7522\u696D\u985E\u5225" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u806F\u7D61\u4EBA" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u806F\u7D61\u96FB\u8A71" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u50B3\u771F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u96FB\u5B50\u90F5\u4EF6" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5099\u8A3B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: filteredCompanies.map((company) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: company.companyNo }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: company.taxId }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: company.name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: company.nameEn }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: company.industry && ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: company.industry, color: "primary", size: "small" })) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: company.contact.name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: company.contact.phone }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: company.fax || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: company.contact.email }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: company.note || '-' }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleEditCompany(company), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => handleDeleteCompany(company.id), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })] }, company.id))) })] }) }), (0, jsx_runtime_1.jsx)(CompanyDetailDialog_1.default, { open: dialogOpen, onClose: () => setDialogOpen(false), companyData: selectedCompany, onSave: handleSaveCompany })] }));
};
exports.default = CompanyManagement;
