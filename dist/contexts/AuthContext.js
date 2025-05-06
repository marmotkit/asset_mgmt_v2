"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = exports.AuthProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const auth_service_1 = require("../services/auth.service");
const AuthContext = (0, react_1.createContext)({
    isAuthenticated: false,
    user: null,
    login: async () => { },
    logout: () => { },
});
const AuthProvider = ({ children }) => {
    const [user, setUser] = (0, react_1.useState)(null);
    const [isAuthenticated, setIsAuthenticated] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const currentUser = auth_service_1.AuthService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
        }
    }, []);
    const login = async (username, password) => {
        try {
            const user = await auth_service_1.AuthService.login(username, password);
            setUser(user);
            setIsAuthenticated(true);
        }
        catch (error) {
            throw error;
        }
    };
    const logout = () => {
        auth_service_1.AuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };
    return ((0, jsx_runtime_1.jsx)(AuthContext.Provider, { value: { isAuthenticated, user, login, logout }, children: children }));
};
exports.AuthProvider = AuthProvider;
const useAuth = () => (0, react_1.useContext)(AuthContext);
exports.useAuth = useAuth;
