import { Invoice, Receipt, DocumentFilter, InvoiceType } from '../types/invoice';
import { storageService } from './storageService';

class InvoiceService {
    private lastInvoiceNumber: { [key: string]: number } = {
        '二聯式': 0,
        '三聯式': 0
    };

    constructor() {
        // 初始化時從 localStorage 讀取最後使用的編號
        const storedNumbers = localStorage.getItem('lastInvoiceNumbers');
        if (storedNumbers) {
            this.lastInvoiceNumber = JSON.parse(storedNumbers);
        }
    }

    private generateInvoiceNumber(type: '二聯式' | '三聯式'): string {
        // 增加編號
        this.lastInvoiceNumber[type] += 1;

        // 儲存新編號
        localStorage.setItem('lastInvoiceNumbers', JSON.stringify(this.lastInvoiceNumber));

        // 格式化編號為 8 位數，前面補 0
        return `AB-${this.lastInvoiceNumber[type].toString().padStart(8, '0')}`;
    }

    private generateReceiptNumber(): string {
        const timestamp = Date.now();
        return `R-${timestamp}`;
    }

    async createInvoice(data: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
        const invoiceNumber = this.generateInvoiceNumber(data.type);
        const invoice: Invoice = {
            ...data,
            id: `invoice-${Date.now()}`,
            invoiceNumber
        };

        await this.saveDocument(invoice);
        return invoice;
    }

    async createReceipt(data: Omit<Receipt, 'id' | 'receiptNumber'>): Promise<Receipt> {
        const receiptNumber = this.generateReceiptNumber();
        const receipt: Receipt = {
            ...data,
            id: `receipt-${Date.now()}`,
            receiptNumber
        };

        await this.saveDocument(receipt);
        return receipt;
    }

    private async saveDocument(document: Invoice | Receipt) {
        const documents = await this.getDocuments({});
        documents.push(document);
        await storageService.updateData('documents', documents);
    }

    async getDocuments(query: { memberId?: string }): Promise<(Invoice | Receipt)[]> {
        const documents = await storageService.getData<(Invoice | Receipt)[]>('documents') || [];
        if (query.memberId) {
            return documents.filter(doc => doc.memberId === query.memberId);
        }
        return documents;
    }

    getCompanyInfo() {
        return {
            name: '測試公司',
            taxId: '12345678'
        };
    }
}

export const invoiceService = new InvoiceService(); 