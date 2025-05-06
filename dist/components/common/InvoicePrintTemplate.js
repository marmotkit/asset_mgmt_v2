"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceCopy = exports.InvoiceType = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const format_1 = require("../../utils/format");
// 定義發票類型
var InvoiceType;
(function (InvoiceType) {
    InvoiceType["INVOICE2"] = "invoice2";
    InvoiceType["INVOICE3"] = "invoice3";
    InvoiceType["RECEIPT"] = "receipt";
})(InvoiceType || (exports.InvoiceType = InvoiceType = {}));
// 定義發票聯式
var InvoiceCopy;
(function (InvoiceCopy) {
    InvoiceCopy["STUB"] = "stub";
    InvoiceCopy["RECEIPT"] = "receipt";
    InvoiceCopy["ACCOUNTING"] = "accounting";
})(InvoiceCopy || (exports.InvoiceCopy = InvoiceCopy = {}));
// 樣式化組件
const PrintContainer = (0, material_1.styled)(material_1.Paper)(({ theme }) => ({
    width: '210mm',
    minHeight: '148mm',
    padding: theme.spacing(4),
    margin: '0 auto',
    backgroundColor: '#fff',
    boxShadow: 'none',
    position: 'relative',
    overflow: 'hidden',
    '@media print': {
        boxShadow: 'none',
        margin: 0,
        padding: theme.spacing(2),
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
    },
}));
const InvoiceHeader = (0, material_1.styled)(material_1.Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));
const InvoiceTitle = (0, material_1.styled)(material_1.Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
}));
const InvoiceTable = (0, material_1.styled)(material_1.Box)(({ theme }) => ({
    border: '1px solid #000',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));
const TableRow = (0, material_1.styled)(material_1.Grid)(({ theme }) => ({
    borderBottom: '1px solid #000',
    '&:last-child': {
        borderBottom: 'none',
    },
}));
const TableCell = (0, material_1.styled)(material_1.Grid)(({ theme }) => ({
    padding: theme.spacing(1),
    borderRight: '1px solid #000',
    '&:last-child': {
        borderRight: 'none',
    },
}));
const InvoiceFooter = (0, material_1.styled)(material_1.Box)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));
const WatermarkBox = (0, material_1.styled)(material_1.Box)(({ theme }) => ({
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 0,
}));
const WatermarkText = (0, material_1.styled)(material_1.Typography)(({ theme }) => ({
    fontSize: '6rem',
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.08)',
    transform: 'rotate(-45deg)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
}));
// 獲取聯式名稱
const getCopyName = (type, copy) => {
    if (type === InvoiceType.RECEIPT) {
        return '收據';
    }
    switch (copy) {
        case InvoiceCopy.STUB:
            return '存根聯';
        case InvoiceCopy.RECEIPT:
            return '收執聯';
        case InvoiceCopy.ACCOUNTING:
            return '報帳聯';
        default:
            return '';
    }
};
// 獲取發票標題
const getInvoiceTitle = (type) => {
    switch (type) {
        case InvoiceType.INVOICE2:
            return '二聯式統一發票';
        case InvoiceType.INVOICE3:
            return '三聯式統一發票';
        case InvoiceType.RECEIPT:
            return '收據';
        default:
            return '發票';
    }
};
// 主組件
const InvoicePrintTemplate = ({ data, copy }) => {
    const { type, number, date, buyerName, buyerTaxId, amount, itemName, note, investmentName, year, month } = data;
    // 格式化日期
    const formattedDate = new Date(date).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    // 獲取聯式名稱
    const copyName = getCopyName(type, copy);
    // 獲取發票標題
    const title = getInvoiceTitle(type);
    return ((0, jsx_runtime_1.jsxs)(PrintContainer, { children: [(0, jsx_runtime_1.jsx)(WatermarkBox, { children: (0, jsx_runtime_1.jsx)(WatermarkText, { children: copyName }) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { position: 'relative', zIndex: 1 }, children: [(0, jsx_runtime_1.jsx)(InvoiceHeader, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, justifyContent: "space-between", alignItems: "center", children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, children: [(0, jsx_runtime_1.jsx)(InvoiceTitle, { variant: "h4", children: title }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: copyName })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", children: ["\u767C\u7968\u865F\u78BC\uFF1A", number || '自動產生'] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", children: ["\u65E5\u671F\uFF1A", formattedDate] })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Divider, {}), (0, jsx_runtime_1.jsx)(material_1.Box, { mt: 2, mb: 2, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u8CB7\u53D7\u4EBA\uFF1A" }), " ", buyerName] }) }), type !== InvoiceType.RECEIPT && buyerTaxId && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u7D71\u4E00\u7DE8\u865F\uFF1A" }), " ", buyerTaxId] }) })), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u6295\u8CC7\u9805\u76EE\uFF1A" }), " ", investmentName] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u79DF\u671F\uFF1A" }), " ", year, "\u5E74", month, "\u6708"] }) })] }) }), (0, jsx_runtime_1.jsxs)(InvoiceTable, { children: [(0, jsx_runtime_1.jsxs)(TableRow, { container: true, children: [(0, jsx_runtime_1.jsx)(TableCell, { item: true, xs: 1, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", align: "center", children: "\u9805\u6B21" }) }), (0, jsx_runtime_1.jsx)(TableCell, { item: true, xs: 7, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", align: "center", children: "\u54C1\u540D" }) }), (0, jsx_runtime_1.jsx)(TableCell, { item: true, xs: 2, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", align: "center", children: "\u6578\u91CF" }) }), (0, jsx_runtime_1.jsx)(TableCell, { item: true, xs: 2, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", align: "center", children: "\u91D1\u984D" }) })] }), (0, jsx_runtime_1.jsxs)(TableRow, { container: true, children: [(0, jsx_runtime_1.jsx)(TableCell, { item: true, xs: 1, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", align: "center", children: "1" }) }), (0, jsx_runtime_1.jsx)(TableCell, { item: true, xs: 7, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: itemName }) }), (0, jsx_runtime_1.jsx)(TableCell, { item: true, xs: 2, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", align: "center", children: "1" }) }), (0, jsx_runtime_1.jsx)(TableCell, { item: true, xs: 2, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", align: "right", children: (0, format_1.formatCurrency)(amount) }) })] }), (0, jsx_runtime_1.jsxs)(TableRow, { container: true, children: [(0, jsx_runtime_1.jsx)(TableCell, { item: true, xs: 10, style: { textAlign: 'right' }, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: (0, jsx_runtime_1.jsx)("strong", { children: "\u7E3D\u8A08\uFF1A" }) }) }), (0, jsx_runtime_1.jsx)(TableCell, { item: true, xs: 2, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", align: "right", children: (0, jsx_runtime_1.jsx)("strong", { children: (0, format_1.formatCurrency)(amount) }) }) })] })] }), note && ((0, jsx_runtime_1.jsx)(material_1.Box, { mt: 2, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u5099\u8A3B\uFF1A" }), " ", note] }) })), (0, jsx_runtime_1.jsx)(InvoiceFooter, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 4, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", align: "center", children: (0, jsx_runtime_1.jsx)("strong", { children: "\u958B\u7ACB\u4EBA" }) }), (0, jsx_runtime_1.jsx)(material_1.Box, { mt: 4, textAlign: "center", children: (0, jsx_runtime_1.jsx)(material_1.Divider, {}) })] }), type !== InvoiceType.RECEIPT && ((0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", align: "center", children: (0, jsx_runtime_1.jsx)("strong", { children: "\u6703\u8A08" }) }), (0, jsx_runtime_1.jsx)(material_1.Box, { mt: 4, textAlign: "center", children: (0, jsx_runtime_1.jsx)(material_1.Divider, {}) })] })), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: type !== InvoiceType.RECEIPT ? 4 : 8, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", align: "center", children: (0, jsx_runtime_1.jsx)("strong", { children: "\u6536\u53D7\u4EBA" }) }), (0, jsx_runtime_1.jsx)(material_1.Box, { mt: 4, textAlign: "center", children: (0, jsx_runtime_1.jsx)(material_1.Divider, {}) })] })] }) })] })] }));
};
exports.default = InvoicePrintTemplate;
