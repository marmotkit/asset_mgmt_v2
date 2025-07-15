import { Invoice, Receipt, DocumentFilter, InvoiceType } from '../types/invoice';
import { ApiService } from './api.service';

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
        try {
            // 將發票/收據資料儲存到雲端資料庫
            const response = await fetch('https://asset-mgmt-api-clean.onrender.com/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(document),
            });

            if (!response.ok) {
                throw new Error('儲存文件失敗');
            }

            return await response.json();
        } catch (error) {
            console.error('儲存文件失敗:', error);
            throw error;
        }
    }

    async getDocuments(query: { memberId?: string }): Promise<(Invoice | Receipt)[]> {
        try {
            const token = localStorage.getItem('token');
            let url = 'https://asset-mgmt-api-clean.onrender.com/api/documents';

            if (query.memberId) {
                url += `?memberId=${query.memberId}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('載入文件失敗');
            }

            const documents = await response.json();
            return documents || [];
        } catch (error) {
            console.error('載入文件失敗:', error);
            // 如果 API 失敗，回退到 localStorage
            const documents = JSON.parse(localStorage.getItem('documents') || '[]');
            if (query.memberId) {
                return documents.filter((doc: any) => doc.memberId === query.memberId);
            }
            return documents;
        }
    }

    getCompanyInfo() {
        return {
            name: '測試公司',
            taxId: '12345678'
        };
    }

    async deleteDocument(id: string): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/documents/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('刪除文件失敗');
            }
        } catch (error) {
            console.error('刪除文件失敗:', error);
            // 如果 API 失敗，回退到 localStorage
            const documents = JSON.parse(localStorage.getItem('documents') || '[]');
            const updatedDocuments = documents.filter((doc: any) => doc.id !== id);
            localStorage.setItem('documents', JSON.stringify(updatedDocuments));
        }
    }
}

export const invoiceService = new InvoiceService(); 