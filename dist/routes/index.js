"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const Layout_1 = __importDefault(require("../components/layout/Layout"));
const Login_1 = __importDefault(require("../components/pages/auth/Login"));
const UserManagement_1 = __importDefault(require("../components/pages/admin/UserManagement"));
const CompanyManagement_1 = __importDefault(require("../components/pages/company/CompanyManagement"));
const InvestmentManagement_1 = __importDefault(require("../components/pages/investment/InvestmentManagement"));
const FeeManagement_1 = __importDefault(require("../components/pages/fees/FeeManagement"));
const InvoicePrintPage_1 = __importDefault(require("../components/pages/investment/InvoicePrintPage"));
// 保護路由的高階組件
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = (0, AuthContext_1.useAuth)();
    if (!isAuthenticated) {
        return <react_router_dom_1.Navigate to="/login" replace/>;
    }
    return <Layout_1.default>{children}</Layout_1.default>;
};
const AppRoutes = () => {
    return (<react_router_dom_1.Routes>
      {/* 公開路由 */}
      <react_router_dom_1.Route path="/login" element={<Login_1.default />}/>

      {/* 受保護路由 */}
      <react_router_dom_1.Route path="/" element={<ProtectedRoute>
          <react_router_dom_1.Navigate to="/users" replace/>
        </ProtectedRoute>}/>

      <react_router_dom_1.Route path="/users" element={<ProtectedRoute>
          <UserManagement_1.default />
        </ProtectedRoute>}/>

      <react_router_dom_1.Route path="/fees" element={<ProtectedRoute>
          <FeeManagement_1.default />
        </ProtectedRoute>}/>

      <react_router_dom_1.Route path="/companies" element={<ProtectedRoute>
          <CompanyManagement_1.default />
        </ProtectedRoute>}/>

      <react_router_dom_1.Route path="/investment" element={<ProtectedRoute>
          <InvestmentManagement_1.default />
        </ProtectedRoute>}/>

      <react_router_dom_1.Route path="/investment/invoice/print/:invoiceId" element={<InvoicePrintPage_1.default />}/>

      <react_router_dom_1.Route path="/services" element={<ProtectedRoute>
          <div>會員服務</div>
        </ProtectedRoute>}/>

      <react_router_dom_1.Route path="/payment" element={<ProtectedRoute>
          <div>交易支付</div>
        </ProtectedRoute>}/>

      <react_router_dom_1.Route path="/notifications" element={<ProtectedRoute>
          <div>通知提醒</div>
        </ProtectedRoute>}/>

      <react_router_dom_1.Route path="/security" element={<ProtectedRoute>
          <div>安全隱私</div>
        </ProtectedRoute>}/>

      {/* 404 路由 */}
      <react_router_dom_1.Route path="*" element={<ProtectedRoute>
          <div>404 Not Found</div>
        </ProtectedRoute>}/>
    </react_router_dom_1.Routes>);
};
exports.default = AppRoutes;
