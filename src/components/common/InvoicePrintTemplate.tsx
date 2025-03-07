import React from 'react';
import { Box, Typography, Grid, Divider, Paper, styled } from '@mui/material';
import { formatCurrency } from '../../utils/format';

// 定義發票類型
export enum InvoiceType {
    INVOICE2 = 'invoice2',
    INVOICE3 = 'invoice3',
    RECEIPT = 'receipt',
}

// 定義發票聯式
export enum InvoiceCopy {
    STUB = 'stub',         // 存根聯
    RECEIPT = 'receipt',   // 收執聯
    ACCOUNTING = 'accounting', // 報帳聯
}

// 定義發票數據接口
export interface InvoiceData {
    id: string;
    type: InvoiceType;
    number?: string;
    date: string;
    buyerName: string;
    buyerTaxId?: string;
    amount: number;
    itemName: string;
    note?: string;
    investmentName: string;
    year: number;
    month: number;
}

interface InvoicePrintTemplateProps {
    data: InvoiceData;
    copy: InvoiceCopy;
}

// 樣式化組件
const PrintContainer = styled(Paper)(({ theme }) => ({
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

const InvoiceHeader = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const InvoiceTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
}));

const InvoiceTable = styled(Box)(({ theme }) => ({
    border: '1px solid #000',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const TableRow = styled(Grid)(({ theme }) => ({
    borderBottom: '1px solid #000',
    '&:last-child': {
        borderBottom: 'none',
    },
}));

const TableCell = styled(Grid)(({ theme }) => ({
    padding: theme.spacing(1),
    borderRight: '1px solid #000',
    '&:last-child': {
        borderRight: 'none',
    },
}));

const InvoiceFooter = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const WatermarkBox = styled(Box)(({ theme }) => ({
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

const WatermarkText = styled(Typography)(({ theme }) => ({
    fontSize: '6rem',
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.08)',
    transform: 'rotate(-45deg)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
}));

// 獲取聯式名稱
const getCopyName = (type: InvoiceType, copy: InvoiceCopy): string => {
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
const getInvoiceTitle = (type: InvoiceType): string => {
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
const InvoicePrintTemplate: React.FC<InvoicePrintTemplateProps> = ({ data, copy }) => {
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

    return (
        <PrintContainer>
            {/* 水印 - 聯式名稱 */}
            <WatermarkBox>
                <WatermarkText>{copyName}</WatermarkText>
            </WatermarkBox>

            {/* 發票頭部 */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <InvoiceHeader>
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <InvoiceTitle variant="h4">{title}</InvoiceTitle>
                            <Typography variant="subtitle1">
                                {copyName}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body1">
                                發票號碼：{number || '自動產生'}
                            </Typography>
                            <Typography variant="body1">
                                日期：{formattedDate}
                            </Typography>
                        </Grid>
                    </Grid>
                </InvoiceHeader>

                <Divider />

                {/* 買受人資訊 */}
                <Box mt={2} mb={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>買受人：</strong> {buyerName}
                            </Typography>
                        </Grid>
                        {type !== InvoiceType.RECEIPT && buyerTaxId && (
                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    <strong>統一編號：</strong> {buyerTaxId}
                                </Typography>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>投資項目：</strong> {investmentName}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>租期：</strong> {year}年{month}月
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* 發票明細表 */}
                <InvoiceTable>
                    <TableRow container>
                        <TableCell item xs={1}>
                            <Typography variant="body2" align="center">項次</Typography>
                        </TableCell>
                        <TableCell item xs={7}>
                            <Typography variant="body2" align="center">品名</Typography>
                        </TableCell>
                        <TableCell item xs={2}>
                            <Typography variant="body2" align="center">數量</Typography>
                        </TableCell>
                        <TableCell item xs={2}>
                            <Typography variant="body2" align="center">金額</Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow container>
                        <TableCell item xs={1}>
                            <Typography variant="body2" align="center">1</Typography>
                        </TableCell>
                        <TableCell item xs={7}>
                            <Typography variant="body2">{itemName}</Typography>
                        </TableCell>
                        <TableCell item xs={2}>
                            <Typography variant="body2" align="center">1</Typography>
                        </TableCell>
                        <TableCell item xs={2}>
                            <Typography variant="body2" align="right">{formatCurrency(amount)}</Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow container>
                        <TableCell item xs={10} style={{ textAlign: 'right' }}>
                            <Typography variant="body2"><strong>總計：</strong></Typography>
                        </TableCell>
                        <TableCell item xs={2}>
                            <Typography variant="body2" align="right"><strong>{formatCurrency(amount)}</strong></Typography>
                        </TableCell>
                    </TableRow>
                </InvoiceTable>

                {/* 備註 */}
                {note && (
                    <Box mt={2}>
                        <Typography variant="body2">
                            <strong>備註：</strong> {note}
                        </Typography>
                    </Box>
                )}

                {/* 發票底部 */}
                <InvoiceFooter>
                    <Grid container spacing={4}>
                        <Grid item xs={4}>
                            <Typography variant="body2" align="center">
                                <strong>開立人</strong>
                            </Typography>
                            <Box mt={4} textAlign="center">
                                <Divider />
                            </Box>
                        </Grid>
                        {type !== InvoiceType.RECEIPT && (
                            <Grid item xs={4}>
                                <Typography variant="body2" align="center">
                                    <strong>會計</strong>
                                </Typography>
                                <Box mt={4} textAlign="center">
                                    <Divider />
                                </Box>
                            </Grid>
                        )}
                        <Grid item xs={type !== InvoiceType.RECEIPT ? 4 : 8}>
                            <Typography variant="body2" align="center">
                                <strong>收受人</strong>
                            </Typography>
                            <Box mt={4} textAlign="center">
                                <Divider />
                            </Box>
                        </Grid>
                    </Grid>
                </InvoiceFooter>
            </Box>
        </PrintContainer>
    );
};

export default InvoicePrintTemplate; 