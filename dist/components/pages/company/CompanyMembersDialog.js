"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const userService_1 = require("../../../services/userService");
const CompanyMembersDialog = ({ open, onClose, companyId, companyName }) => {
    const [members, setMembers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (open && companyId) {
            loadCompanyMembers();
        }
    }, [open, companyId]);
    const loadCompanyMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const allUsers = await userService_1.userService.getUsers();
            // 篩選出屬於該公司的會員
            const companyMembers = allUsers.filter(user => user.companyId === companyId);
            setMembers(companyMembers);
        }
        catch (err) {
            setError('載入會員資料失敗');
            console.error('載入公司會員失敗:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return '管理員';
            case 'normal':
                return '一般會員';
            case 'business':
                return '商務會員';
            case 'lifetime':
                return '永久會員';
            default:
                return role;
        }
    };
    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'success';
            case 'business':
                return 'info';
            case 'normal':
                return 'info';
            case 'lifetime':
                return 'info';
            default:
                return 'default';
        }
    };
    const getStatusLabel = (status) => {
        switch (status) {
            case 'active':
                return '啟用';
            case 'inactive':
                return '停用';
            case 'suspended':
                return '暫停';
            default:
                return status;
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'error';
            case 'suspended':
                return 'warning';
            default:
                return 'default';
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: onClose, maxWidth: "lg", fullWidth: true, children: [(0, jsx_runtime_1.jsxs)(material_1.DialogTitle, { children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", children: [companyName, " - \u6240\u5C6C\u6703\u54E1"] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u5171 ", members.length, " \u4F4D\u6703\u54E1"] })] }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: [error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 2 }, children: error })), loading ? ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })) : members.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", color: "text.secondary", children: "\u6B64\u516C\u53F8\u76EE\u524D\u6C92\u6709\u6240\u5C6C\u6703\u54E1" }) })) : ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, variant: "outlined", children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u59D3\u540D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5E33\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u96FB\u5B50\u90F5\u4EF6" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u89D2\u8272" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5EFA\u7ACB\u6642\u9593" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: members.map((member) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: member.memberNo }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: member.name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: member.username }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: member.email }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getRoleLabel(member.role), color: getRoleColor(member.role), size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusLabel(member.status), color: getStatusColor(member.status), size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: new Date(member.createdAt).toLocaleDateString('zh-TW') })] }, member.id))) })] }) }))] }), (0, jsx_runtime_1.jsx)(material_1.DialogActions, { children: (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onClose, children: "\u95DC\u9589" }) })] }));
};
exports.default = CompanyMembersDialog;
