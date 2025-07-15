"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceService = void 0;
class InvoiceService {
    constructor() {
        this.lastInvoiceNumber = {
            '二聯式': 0,
            '三聯式': 0
        };
        // 初始化時從 localStorage 讀取最後使用的編號
        const storedNumbers = localStorage.getItem('lastInvoiceNumbers');
        if (storedNumbers) {
            this.lastInvoiceNumber = JSON.parse(storedNumbers);
        }
    }
    generateInvoiceNumber(type) {
        // 增加編號
        this.lastInvoiceNumber[type] += 1;
        // 儲存新編號
        localStorage.setItem('lastInvoiceNumbers', JSON.stringify(this.lastInvoiceNumber));
        // 格式化編號為 8 位數，前面補 0
        return `AB-${this.lastInvoiceNumber[type].toString().padStart(8, '0')}`;
    }
    generateReceiptNumber() {
        const timestamp = Date.now();
        return `R-${timestamp}`;
    }
    async createInvoice(data) {
        const invoiceNumber = this.generateInvoiceNumber(data.type);
        const invoice = {
            ...data,
            id: `invoice-${Date.now()}`,
            invoiceNumber
        };
        await this.saveDocument(invoice);
        return invoice;
    }
    async createReceipt(data) {
        const receiptNumber = this.generateReceiptNumber();
        const receipt = {
            ...data,
            id: `receipt-${Date.now()}`,
            receiptNumber
        };
        await this.saveDocument(receipt);
        return receipt;
    }
    async saveDocument(document) {
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
        }
        catch (error) {
            console.error('儲存文件失敗:', error);
            throw error;
        }
    }
    async getDocuments(query) {
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
        }
        catch (error) {
            console.error('載入文件失敗:', error);
            // 如果 API 失敗，回退到 localStorage
            const documents = JSON.parse(localStorage.getItem('documents') || '[]');
            if (query.memberId) {
                return documents.filter((doc) => doc.memberId === query.memberId);
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
    async deleteDocument(id) {
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
        }
        catch (error) {
            console.error('刪除文件失敗:', error);
            // 如果 API 失敗，回退到 localStorage
            const documents = JSON.parse(localStorage.getItem('documents') || '[]');
            const updatedDocuments = documents.filter((doc) => doc.id !== id);
            localStorage.setItem('documents', JSON.stringify(updatedDocuments));
        }
    }
}
exports.invoiceService = new InvoiceService();
