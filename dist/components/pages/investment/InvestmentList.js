"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const format_1 = require("../../../utils/format");
const api_service_1 = require("../../../services/api.service");
const InvestmentList = ({ investments, onEditInvestment, onDeleteInvestment }) => {
    const [companies, setCompanies] = (0, react_1.useState)({});
    const [users, setUsers] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        const loadCompanies = async () => {
            try {
                const data = await api_service_1.ApiService.getCompanies();
                const companyMap = data.reduce((acc, company) => {
                    acc[company.id] = company;
                    return acc;
                }, {});
                setCompanies(companyMap);
            }
            catch (error) {
                console.error('載入公司資料失敗:', error);
            }
        };
        const loadUsers = async () => {
            try {
                const data = await api_service_1.ApiService.getUsers();
                const userMap = data.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {});
                setUsers(userMap);
            }
            catch (error) {
                console.error('載入會員資料失敗:', error);
            }
        };
        loadCompanies();
        loadUsers();
    }, []);
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'completed':
                return 'success';
            case 'terminated':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };
    const getStatusLabel = (status) => {
        switch (status) {
            case 'active':
                return '進行中';
            case 'completed':
                return '已完成';
            case 'terminated':
                return '已終止';
            case 'pending':
                return '審核中';
            default:
                return status;
        }
    };
    return ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u8D77\u8A16\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6240\u5C6C\u516C\u53F8" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6240\u5C6C\u6703\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [investments.map((investment) => {
                            var _a, _b;
                            return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: investment.name }), investment.description && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: investment.description }))] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: investment.type === 'movable' ? '動產' : '不動產' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, format_1.formatCurrency)(investment.amount) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [investment.startDate, " ", investment.endDate ? `~ ${investment.endDate}` : ''] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: investment.companyId && ((_a = companies[investment.companyId]) === null || _a === void 0 ? void 0 : _a.name) || '' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: investment.userId && ((_b = users[investment.userId]) === null || _b === void 0 ? void 0 : _b.name) || '' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusLabel(investment.status), color: getStatusColor(investment.status), size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { display: "flex", gap: 1, children: [(0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u7DE8\u8F2F", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => onEditInvestment(investment), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }) }), (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u522A\u9664", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => onDeleteInvestment(investment), color: "error", children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) }) })] }) })] }, investment.id));
                        }), investments.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 8, align: "center", children: "\u5C1A\u7121\u6295\u8CC7\u9805\u76EE" }) }))] })] }) }));
};
exports.default = InvestmentList;
