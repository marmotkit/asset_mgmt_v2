"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const InvoicePrintTemplate_1 = __importStar(require("../../common/InvoicePrintTemplate"));
const services_1 = require("../../../services");
// 全局列印樣式
const printStyles = {
    '@media print': {
        '@page': {
            size: 'A4',
            margin: 0,
        },
        'body': {
            margin: 0,
            padding: 0,
        },
        'html, body': {
            height: '100%',
            overflow: 'visible !important',
        },
    },
};
// 樣式化組件
const PrintPageContainer = (0, material_1.styled)(material_1.Container)(({ theme }) => ({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    '@media print': {
        margin: 0,
        padding: 0,
    },
}));
const ButtonsContainer = (0, material_1.styled)(material_1.Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    '@media print': {
        display: 'none',
    },
}));
const PrintButton = (0, material_1.styled)(material_1.Button)(({ theme }) => ({
    '@media print': {
        display: 'none',
    },
}));
const PrintCopiesContainer = (0, material_1.styled)(material_1.Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    '@media print': {
        margin: 0,
        padding: 0,
        gap: 0,
    },
}));
const InvoiceCopyContainer = (0, material_1.styled)(material_1.Box)(({ theme }) => ({
    position: 'relative',
    marginBottom: theme.spacing(4),
    '@media print': {
        marginBottom: 0,
        pageBreakAfter: 'always',
        '&:last-child': {
            pageBreakAfter: 'auto',
        },
    },
}));
const PageBreak = (0, material_1.styled)(material_1.Box)({
    height: '1px',
    width: '100%',
    '@media print': {
        pageBreakAfter: 'always',
    },
    '@media screen': {
        marginBottom: '2rem',
        borderBottom: '1px dashed #ccc',
    },
});
// 主組件
const InvoicePrintPage = () => {
    const { invoiceId } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [invoiceData, setInvoiceData] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const loadInvoiceData = async () => {
            if (!invoiceId) {
                setError('發票 ID 無效');
                setLoading(false);
                return;
            }
            try {
                // 載入發票資料
                const allInvoices = await services_1.ApiService.getInvoices();
                const invoice = allInvoices.find(inv => inv.id === invoiceId);
                if (!invoice) {
                    setError('找不到發票資料');
                    setLoading(false);
                    return;
                }
                // 載入投資項目資料
                const investment = await services_1.ApiService.getInvestment(invoice.investmentId);
                if (!investment) {
                    setError('找不到投資項目資料');
                    setLoading(false);
                    return;
                }
                // 載入租金收款資料
                const payment = await services_1.ApiService.getRentalPayments(invoice.investmentId)
                    .then(payments => payments.find(p => p.id === invoice.paymentId));
                if (!payment) {
                    setError('找不到租金收款資料');
                    setLoading(false);
                    return;
                }
                // 設置發票資料
                setInvoiceData({
                    id: invoice.id,
                    type: invoice.type,
                    number: invoice.number || `INV-${invoice.id.substring(0, 8)}`,
                    date: invoice.date,
                    buyerName: invoice.buyerName,
                    buyerTaxId: invoice.buyerTaxId,
                    amount: invoice.amount,
                    itemName: invoice.itemName || '租金收入',
                    note: invoice.note,
                    investmentName: investment.name,
                    year: payment.year,
                    month: payment.month,
                });
                setLoading(false);
            }
            catch (err) {
                console.error('載入發票資料失敗:', err);
                setError('載入發票資料失敗');
                setLoading(false);
            }
        };
        loadInvoiceData();
    }, [invoiceId]);
    const handlePrint = () => {
        window.print();
    };
    const handleBack = () => {
        navigate('/investment');
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "md", sx: { mt: 4, textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { mt: 2 }, children: "\u8F09\u5165\u767C\u7968\u8CC7\u6599\u4E2D..." })] }));
    }
    if (error || !invoiceData) {
        return ((0, jsx_runtime_1.jsx)(material_1.Container, { maxWidth: "md", sx: { mt: 4 }, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", color: "error", gutterBottom: true, children: "\u932F\u8AA4" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: error || '無法載入發票資料' }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.ArrowBack, {}), onClick: handleBack, sx: { mt: 2 }, children: "\u8FD4\u56DE" })] }) }));
    }
    // 根據發票類型決定需要顯示的聯式
    const copies = invoiceData.type === InvoicePrintTemplate_1.InvoiceType.INVOICE3
        ? [InvoicePrintTemplate_1.InvoiceCopy.STUB, InvoicePrintTemplate_1.InvoiceCopy.RECEIPT, InvoicePrintTemplate_1.InvoiceCopy.ACCOUNTING]
        : invoiceData.type === InvoicePrintTemplate_1.InvoiceType.INVOICE2
            ? [InvoicePrintTemplate_1.InvoiceCopy.STUB, InvoicePrintTemplate_1.InvoiceCopy.RECEIPT]
            : [InvoicePrintTemplate_1.InvoiceCopy.RECEIPT];
    return ((0, jsx_runtime_1.jsxs)(PrintPageContainer, { maxWidth: "lg", children: [(0, jsx_runtime_1.jsx)(material_1.GlobalStyles, { styles: printStyles }), (0, jsx_runtime_1.jsxs)(ButtonsContainer, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.ArrowBack, {}), onClick: handleBack, children: "\u8FD4\u56DE" }), (0, jsx_runtime_1.jsx)(PrintButton, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Print, {}), onClick: handlePrint, color: "primary", children: "\u5217\u5370" })] }), (0, jsx_runtime_1.jsx)(PrintCopiesContainer, { children: copies.map((copy, index) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsx)(InvoiceCopyContainer, { children: (0, jsx_runtime_1.jsx)(InvoicePrintTemplate_1.default, { data: invoiceData, copy: copy }) }), index < copies.length - 1 && (0, jsx_runtime_1.jsx)(PageBreak, {})] }, copy))) })] }));
};
exports.default = InvoicePrintPage;
