// 資產管理系統配置檔案
// 此檔案用於存放系統配置參數

// 系統基本配置
window.APP_CONFIG = {
    // API 基礎 URL
    API_BASE_URL: process.env.NODE_ENV === 'production'
        ? 'https://asset-mgmt-api.onrender.com/api'
        : 'http://localhost:3001/api',

    // 系統名稱
    APP_NAME: '資產管理系統',

    // 版本號
    VERSION: '2.0.0',

    // 是否為開發環境
    IS_DEV: process.env.NODE_ENV !== 'production',

    // 是否在 Render 環境
    IS_RENDER: window.location.hostname.includes('onrender.com'),

    // 其他配置參數
    DEBUG_MODE: false,
    LOG_LEVEL: 'info'
};

// 導出配置（如果使用模組系統）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.APP_CONFIG;
} 