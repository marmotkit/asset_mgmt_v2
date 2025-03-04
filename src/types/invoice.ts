import { PaymentStatus } from './fee';

export type InvoiceType = '二聯式' | '三聯式' | '收據';

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface BaseDocument {
    id: string;
    memberId: string;
    memberName: string;
    amount: number;
    date: string;
    paymentId: string;
    createdAt: string;
    updatedAt: string;
    note?: string;
}

export interface Invoice extends BaseDocument {
    type: '二聯式' | '三聯式';
    invoiceNumber: string;
    sellerName: string;
    sellerTaxId: string;
    buyerName?: string;
    buyerTaxId?: string;
    items: InvoiceItem[];
    taxAmount: number;
}

export interface Receipt extends BaseDocument {
    type: '收據';
    receiptNumber: string;
    payerName: string;
    description: string;
}

export type DocumentFilter = {
    memberId?: string;
    startDate?: string;
    endDate?: string;
    type?: InvoiceType;
}; 