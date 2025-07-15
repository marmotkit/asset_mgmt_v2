"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const LockReset_1 = __importDefault(require("@mui/icons-material/LockReset"));
const Dialog_1 = __importDefault(require("@mui/material/Dialog"));
const DialogTitle_1 = __importDefault(require("@mui/material/DialogTitle"));
const DialogContent_1 = __importDefault(require("@mui/material/DialogContent"));
const DialogActions_1 = __importDefault(require("@mui/material/DialogActions"));
const TextField_1 = __importDefault(require("@mui/material/TextField"));
const userService_1 = require("../../../services/userService");
const companyService_1 = require("../../../services/companyService");
const UserDetailDialog_1 = __importDefault(require("./UserDetailDialog"));
const UserManagement = () => {
    const [users, setUsers] = (0, react_1.useState)([]);
    const [selectedUser, setSelectedUser] = (0, react_1.useState)(null);
    const [isDialogOpen, setIsDialogOpen] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [selectedRole, setSelectedRole] = (0, react_1.useState)('all');
    const [selectedStatus, setSelectedStatus] = (0, react_1.useState)('all');
    const [companies, setCompanies] = (0, react_1.useState)([]);
    const [resetPwdDialogOpen, setResetPwdDialogOpen] = (0, react_1.useState)(false);
    const [resetPwdUser, setResetPwdUser] = (0, react_1.useState)(null);
    const [resetPwd, setResetPwd] = (0, react_1.useState)('');
    const [resetPwdError, setResetPwdError] = (0, react_1.useState)('');
    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService_1.userService.getUsers();
            setUsers(data || []);
        }
        catch (err) {
            setError('載入會員資料失敗');
            console.error('載入會員資料失敗:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const loadCompanies = async () => {
        try {
            const data = await companyService_1.companyService.getCompanies();
            setCompanies(data);
        }
        catch (error) {
            console.error('載入公司資料失敗:', error);
        }
    };
    (0, react_1.useEffect)(() => {
        loadUsers();
        loadCompanies();
    }, []);
    const handleAddUser = () => {
        setSelectedUser(null);
        setIsDialogOpen(true);
    };
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };
    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedUser(null);
    };
    const handleSaveUser = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Saving user:', userData);
            let savedUser;
            if (userData.id) {
                // 更新現有會員
                savedUser = await userService_1.userService.updateUser(userData.id, userData);
                console.log('Updated user result:', savedUser);
            }
            else {
                // 建立新會員
                savedUser = await userService_1.userService.createUser(userData);
                console.log('Created user result:', savedUser);
            }
            await loadUsers();
            setIsDialogOpen(false);
            setSelectedUser(null);
        }
        catch (err) {
            console.error('保存會員資料失敗:', err);
            setError(err instanceof Error ? err.message : '保存會員資料失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleOpenResetPwd = (user) => {
        setResetPwdUser(user);
        setResetPwdDialogOpen(true);
        setResetPwd('');
        setResetPwdError('');
    };
    const handleCloseResetPwd = () => {
        setResetPwdDialogOpen(false);
        setResetPwdUser(null);
        setResetPwd('');
        setResetPwdError('');
    };
    const handleResetPwd = async () => {
        // 驗證密碼
        if (!resetPwd) {
            setResetPwdError('請輸入新密碼');
            return;
        }
        else if (resetPwd.length < 6) {
            setResetPwdError('密碼至少6碼');
            return;
        }
        else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(resetPwd)) {
            setResetPwdError('密碼需包含英文與數字');
            return;
        }
        setResetPwdError('');
        try {
            setLoading(true);
            setError(null);
            await userService_1.userService.resetUserPassword(resetPwdUser.id, resetPwd);
            setResetPwdDialogOpen(false);
            setResetPwdUser(null);
            setResetPwd('');
            await loadUsers();
        }
        catch (err) {
            setError('重設密碼失敗');
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
    const getCompanyName = (companyId) => {
        if (!companyId)
            return '-';
        const company = companies.find(c => c.id === companyId);
        return company ? company.name : '-';
    };
    // 更新角色選項
    const roleOptions = [
        { value: 'admin', label: '管理員' },
        { value: 'normal', label: '一般會員' },
        { value: 'business', label: '商務會員' },
        { value: 'lifetime', label: '永久會員' }
    ];
    // 更新狀態選項
    const statusOptions = [
        { value: 'active', label: '啟用' },
        { value: 'inactive', label: '停用' },
        { value: 'suspended', label: '暫停' }
    ];
    // 更新狀態篩選邏輯
    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });
    if (loading && users.length === 0) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", children: "\u6703\u54E1\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: handleAddUser, children: "\u65B0\u589E\u6703\u54E1" })] }), error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 3 }, children: error })), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u59D3\u540D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u96FB\u5B50\u90F5\u4EF6" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u89D2\u8272" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6240\u5C6C\u516C\u53F8" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [filteredUsers.map((user) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: user.memberNo }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: user.name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: user.email }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getRoleLabel(user.role), color: getRoleColor(user.role), size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getCompanyName(user.companyId) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusLabel(user.status), color: user.status === 'active' ? 'success' : 'error', size: "small" }) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u7DE8\u8F2F", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleEditUser(user), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "primary", onClick: () => handleOpenResetPwd(user), children: (0, jsx_runtime_1.jsx)(LockReset_1.default, {}) })] })] }, user.id))), filteredUsers.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 6, align: "center", children: "\u5C1A\u7121\u6703\u54E1\u8CC7\u6599" }) }))] })] }) }), (0, jsx_runtime_1.jsx)(UserDetailDialog_1.default, { open: isDialogOpen, onClose: handleCloseDialog, onSave: handleSaveUser, user: selectedUser }), (0, jsx_runtime_1.jsxs)(Dialog_1.default, { open: resetPwdDialogOpen, onClose: handleCloseResetPwd, children: [(0, jsx_runtime_1.jsx)(DialogTitle_1.default, { children: "\u91CD\u8A2D\u5BC6\u78BC" }), (0, jsx_runtime_1.jsx)(DialogContent_1.default, { children: (0, jsx_runtime_1.jsx)(TextField_1.default, { label: "\u65B0\u5BC6\u78BC", type: "password", value: resetPwd, onChange: e => setResetPwd(e.target.value), error: !!resetPwdError, helperText: resetPwdError || '密碼至少6碼，需包含英文與數字', fullWidth: true, required: true }) }), (0, jsx_runtime_1.jsxs)(DialogActions_1.default, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseResetPwd, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleResetPwd, variant: "contained", children: "\u5132\u5B58" })] })] })] }));
};
exports.default = UserManagement;
