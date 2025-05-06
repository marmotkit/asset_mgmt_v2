"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const styles_1 = require("@mui/material/styles");
const CssBaseline_1 = __importDefault(require("@mui/material/CssBaseline"));
const x_date_pickers_1 = require("@mui/x-date-pickers");
const AdapterDateFns_1 = require("@mui/x-date-pickers/AdapterDateFns");
const locale_1 = require("date-fns/locale");
const AuthContext_1 = require("./contexts/AuthContext");
const theme_1 = __importDefault(require("./theme"));
const storageService_1 = require("./services/storageService");
const routes_1 = __importDefault(require("./routes"));
const App = () => {
    (0, react_1.useEffect)(() => {
        // 初始化資料儲存
        storageService_1.storageService.initialize();
    }, []);
    return ((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsxs)(styles_1.ThemeProvider, { theme: theme_1.default, children: [(0, jsx_runtime_1.jsx)(CssBaseline_1.default, {}), (0, jsx_runtime_1.jsx)(AuthContext_1.AuthProvider, { children: (0, jsx_runtime_1.jsx)(x_date_pickers_1.LocalizationProvider, { dateAdapter: AdapterDateFns_1.AdapterDateFns, adapterLocale: locale_1.zhTW, children: (0, jsx_runtime_1.jsx)(routes_1.default, {}) }) })] }) }));
};
exports.default = App;
