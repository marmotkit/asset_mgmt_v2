import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, CircularProgress, Paper, styled, GlobalStyles } from '@mui/material';
import { Print as PrintIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import InvoicePrintTemplate, { InvoiceType, InvoiceCopy, InvoiceData } from '../../common/InvoicePrintTemplate';
import { ApiService } from '../../../services';

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
const PrintPageContainer = styled(Container)(({ theme }) => ({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    '@media print': {
        margin: 0,
        padding: 0,
    },
}));

const ButtonsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    '@media print': {
        display: 'none',
    },
}));

const PrintButton = styled(Button)(({ theme }) => ({
    '@media print': {
        display: 'none',
    },
}));

const PrintCopiesContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    '@media print': {
        margin: 0,
        padding: 0,
        gap: 0,
    },
}));

const InvoiceCopyContainer = styled(Box)(({ theme }) => ({
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

const PageBreak = styled(Box)({
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
const InvoicePrintPage: React.FC = () => {
    const { invoiceId } = useParams<{ invoiceId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

    useEffect(() => {
        const loadInvoiceData = async () => {
            if (!invoiceId) {
                setError('發票 ID 無效');
                setLoading(false);
                return;
            }

            try {
                // 載入發票資料
                const allInvoices = await ApiService.getInvoices();
                const invoice = allInvoices.find(inv => inv.id === invoiceId);

                if (!invoice) {
                    setError('找不到發票資料');
                    setLoading(false);
                    return;
                }

                // 載入投資項目資料
                const investment = await ApiService.getInvestment(invoice.investmentId);

                if (!investment) {
                    setError('找不到投資項目資料');
                    setLoading(false);
                    return;
                }

                // 載入租金收款資料
                const payment = await ApiService.getRentalPayments(invoice.investmentId)
                    .then(payments => payments.find(p => p.id === invoice.paymentId));

                if (!payment) {
                    setError('找不到租金收款資料');
                    setLoading(false);
                    return;
                }

                // 設置發票資料
                setInvoiceData({
                    id: invoice.id,
                    type: invoice.type as InvoiceType,
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
            } catch (err) {
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
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    載入發票資料中...
                </Typography>
            </Container>
        );
    }

    if (error || !invoiceData) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" color="error" gutterBottom>
                        錯誤
                    </Typography>
                    <Typography variant="body1">
                        {error || '無法載入發票資料'}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                        sx={{ mt: 2 }}
                    >
                        返回
                    </Button>
                </Paper>
            </Container>
        );
    }

    // 根據發票類型決定需要顯示的聯式
    const copies = invoiceData.type === InvoiceType.INVOICE3
        ? [InvoiceCopy.STUB, InvoiceCopy.RECEIPT, InvoiceCopy.ACCOUNTING]
        : invoiceData.type === InvoiceType.INVOICE2
            ? [InvoiceCopy.STUB, InvoiceCopy.RECEIPT]
            : [InvoiceCopy.RECEIPT];

    return (
        <PrintPageContainer maxWidth="lg">
            <GlobalStyles styles={printStyles} />
            <ButtonsContainer>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                >
                    返回
                </Button>
                <PrintButton
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    color="primary"
                >
                    列印
                </PrintButton>
            </ButtonsContainer>

            <PrintCopiesContainer>
                {copies.map((copy, index) => (
                    <React.Fragment key={copy}>
                        <InvoiceCopyContainer>
                            <InvoicePrintTemplate data={invoiceData} copy={copy} />
                        </InvoiceCopyContainer>
                        {index < copies.length - 1 && <PageBreak />}
                    </React.Fragment>
                ))}
            </PrintCopiesContainer>
        </PrintPageContainer>
    );
};

export default InvoicePrintPage; 