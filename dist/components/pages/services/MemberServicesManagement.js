"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const AuthContext_1 = require("../../../contexts/AuthContext");
const services_1 = require("../../../services");
const AnnualActivitiesTab_1 = __importDefault(require("./AnnualActivitiesTab"));
const MemberCareTab_1 = __importDefault(require("./MemberCareTab"));
const RiskManagementTab_1 = __importDefault(require("./RiskManagementTab"));
const RentalPaymentStatusTab_1 = __importDefault(require("./RentalPaymentStatusTab"));
const AssetProfitStatusTab_1 = __importDefault(require("./AssetProfitStatusTab"));
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `services-tabpanel-${index}`, "aria-labelledby": `services-tab-${index}`, ...other, children: value === index && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { p: 3 }, children: children })) }));
}
const MemberServicesManagement = ({ initialTab = 0 }) => {
    const [currentTab, setCurrentTab] = (0, react_1.useState)(initialTab);
    const { user } = (0, AuthContext_1.useAuth)();
    const [hasRentalData, setHasRentalData] = (0, react_1.useState)(false);
    const [hasProfitData, setHasProfitData] = (0, react_1.useState)(false);
    const [isLoadingData, setIsLoadingData] = (0, react_1.useState)(true);
    // 檢查是否為管理者角色
    const isManager = (user === null || user === void 0 ? void 0 : user.role) === 'admin';
    // 檢查用戶是否有租金收款項目或資產分潤資料
    (0, react_1.useEffect)(() => {
        const checkUserData = async () => {
            if (!user)
                return;
            try {
                setIsLoadingData(true);
                // 檢查是否有租金收款資料
                const rentalPayments = await services_1.ApiService.getRentalPayments();
                const hasRental = rentalPayments.length > 0;
                setHasRentalData(hasRental);
                // 檢查是否有資產分潤資料
                const memberProfits = await services_1.ApiService.getMemberProfits();
                const hasProfit = memberProfits.length > 0;
                setHasProfitData(hasProfit);
            }
            catch (error) {
                console.error('檢查用戶資料失敗:', error);
                // 如果檢查失敗，預設顯示所有標籤頁
                setHasRentalData(true);
                setHasProfitData(true);
            }
            finally {
                setIsLoadingData(false);
            }
        };
        checkUserData();
    }, [user]);
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };
    // 定義標籤頁配置
    const tabs = [
        { label: '年度活動', component: (0, jsx_runtime_1.jsx)(AnnualActivitiesTab_1.default, {}), index: 0 },
        { label: '會員關懷', component: (0, jsx_runtime_1.jsx)(MemberCareTab_1.default, {}), index: 1, managerOnly: true },
        { label: '風險管理', component: (0, jsx_runtime_1.jsx)(RiskManagementTab_1.default, {}), index: 2, managerOnly: true },
        { label: '租金付款狀況', component: (0, jsx_runtime_1.jsx)(RentalPaymentStatusTab_1.default, {}), index: 3, hasData: hasRentalData },
        { label: '資產分潤狀況', component: (0, jsx_runtime_1.jsx)(AssetProfitStatusTab_1.default, {}), index: 4, hasData: hasProfitData }
    ];
    // 過濾標籤頁，非管理者不顯示管理員專用頁面，沒有資料的用戶不顯示對應頁面
    const visibleTabs = tabs.filter(tab => {
        // 如果是管理員專用頁面，只有管理者可見
        if (tab.managerOnly && !isManager) {
            return false;
        }
        // 如果有資料要求，檢查用戶是否有對應資料
        if (tab.hasData !== undefined && !tab.hasData) {
            return false;
        }
        return true;
    });
    // 調整當前選中的標籤頁索引
    const adjustedCurrentTab = Math.min(currentTab, visibleTabs.length - 1);
    // 如果正在載入資料，顯示載入中
    if (isLoadingData) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "\u8F09\u5165\u4E2D..." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { width: '100%' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", component: "h1", gutterBottom: true, children: "\u6703\u54E1\u670D\u52D9\u7BA1\u7406" }), (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { width: '100%', mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { borderBottom: 1, borderColor: 'divider' }, children: (0, jsx_runtime_1.jsx)(material_1.Tabs, { value: adjustedCurrentTab, onChange: handleTabChange, "aria-label": "\u6703\u54E1\u670D\u52D9\u7BA1\u7406\u6A19\u7C64", children: visibleTabs.map((tab, index) => ((0, jsx_runtime_1.jsx)(material_1.Tab, { label: tab.label }, tab.index))) }) }), visibleTabs.map((tab, index) => ((0, jsx_runtime_1.jsx)(TabPanel, { value: adjustedCurrentTab, index: index, children: tab.component }, tab.index)))] })] }));
};
exports.default = MemberServicesManagement;
