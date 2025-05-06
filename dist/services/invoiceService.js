"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceService = void 0;
const storageService_1 = require("./storageService");
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
        const documents = await this.getDocuments({});
        documents.push(document);
        await storageService_1.storageService.updateData('documents', documents);
    }
    async getDocuments(query) {
        const documents = await storageService_1.storageService.getData('documents') || [];
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
    async deleteDocument(id) {
        const documents = await this.getDocuments({});
        const updatedDocuments = documents.filter(doc => doc.id !== id);
        await storageService_1.storageService.updateData('documents', updatedDocuments);
    }
}
exports.invoiceService = new InvoiceService();
