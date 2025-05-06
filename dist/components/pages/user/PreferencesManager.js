"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreferencesManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_1 = require("react");
const api_service_1 = require("../../../services/api.service");
const defaultPreferences = {
    id: '',
    userId: '',
    investmentPreferences: {
        riskTolerance: 'moderate',
        investmentPeriod: 'medium',
        preferences: []
    },
    riskTolerance: 'moderate',
    investmentPeriod: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};
const PreferencesManager = ({ userId, onSave }) => {
    const [preferences, setPreferences] = (0, react_1.useState)(defaultPreferences);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const loadPreferences = async () => {
        setLoading(true);
        setError(null);
        try {
            const userPrefs = await api_service_1.ApiService.getUserPreferences(userId);
            if (userPrefs && userPrefs.length > 0) {
                setPreferences({
                    ...defaultPreferences,
                    ...userPrefs[0]
                });
            }
            else {
                setPreferences({
                    ...defaultPreferences,
                    userId
                });
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '載入偏好設定時發生錯誤');
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        if (userId) {
            loadPreferences();
        }
    }, [userId]);
    const handleRiskToleranceChange = (value) => {
        setPreferences(prev => ({
            ...prev,
            riskTolerance: value,
            investmentPreferences: {
                ...prev.investmentPreferences,
                riskTolerance: value
            }
        }));
    };
    const handleInvestmentPeriodChange = (value) => {
        setPreferences(prev => ({
            ...prev,
            investmentPeriod: value,
            investmentPreferences: {
                ...prev.investmentPreferences,
                investmentPeriod: value
            }
        }));
    };
    const handlePreferencesChange = (selectedPreferences) => {
        setPreferences(prev => ({
            ...prev,
            investmentPreferences: {
                ...prev.investmentPreferences,
                preferences: selectedPreferences
            }
        }));
    };
    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const updatedPreferences = await api_service_1.ApiService.updateUserPreferences(userId, [{
                    key: 'investmentPreferences',
                    value: JSON.stringify(preferences.investmentPreferences)
                }]);
            if (onSave) {
                onSave(preferences);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '儲存偏好設定時發生錯誤');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [error && ((0, jsx_runtime_1.jsx)(material_1.Typography, { color: "error", gutterBottom: true, children: error })), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "normal", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u98A8\u96AA\u627F\u53D7\u5EA6" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: preferences.riskTolerance, onChange: (e) => handleRiskToleranceChange(e.target.value), label: "\u98A8\u96AA\u627F\u53D7\u5EA6", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "low", children: "\u4F4E\u98A8\u96AA" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "moderate", children: "\u4E2D\u7B49\u98A8\u96AA" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "high", children: "\u9AD8\u98A8\u96AA" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "normal", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6295\u8CC7\u671F\u9650" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: preferences.investmentPeriod, onChange: (e) => handleInvestmentPeriodChange(e.target.value), label: "\u6295\u8CC7\u671F\u9650", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "short", children: "\u77ED\u671F\uFF081\u5E74\u4EE5\u5167\uFF09" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "medium", children: "\u4E2D\u671F\uFF081-3\u5E74\uFF09" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "long", children: "\u9577\u671F\uFF083\u5E74\u4EE5\u4E0A\uFF09" })] })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { mt: 2, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", onClick: handleSave, disabled: loading, fullWidth: true, children: "\u5132\u5B58\u8A2D\u5B9A" }) })] }));
};
exports.PreferencesManager = PreferencesManager;
