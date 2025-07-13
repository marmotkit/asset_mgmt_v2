// 資產管理系統配置檔案
window.APP_CONFIG = {
    // API 基礎 URL
    API_BASE_URL: "https://asset-mgmt-api-test.onrender.com/api",

    // 系統名稱
    APP_NAME: '資產管理系統',

    // 版本號
    VERSION: '2.0.0',

    // 是否為開發環境
    IS_DEV: false,

    // 是否在 Render 環境
    IS_RENDER: window.location.hostname.includes('onrender.com'),

    // 其他配置參數
    DEBUG_MODE: false,
    LOG_LEVEL: 'info'
};