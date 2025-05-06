"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feeService = void 0;
const uuid_1 = require("uuid");
const storageService_1 = require("./storageService");
const feeHistoryService_1 = require("./feeHistoryService");
const FEE_SETTINGS_KEY = 'feeSettings';
const PAYMENT_STATUS_KEY = 'paymentStatuses';
class FeeService {
    constructor() {
        this.feeSettings = [];
        this.paymentStatuses = [];
        this.loadData();
    }
    async loadData() {
        const settings = await storageService_1.storageService.getData(FEE_SETTINGS_KEY);
        const status = await storageService_1.storageService.getData(PAYMENT_STATUS_KEY);
        if (settings) {
            this.feeSettings = settings;
        }
        if (status) {
            this.paymentStatuses = status;
        }
    }
    async getFeeSettings() {
        if (this.feeSettings.length === 0) {
            await this.loadData();
        }
        return this.feeSettings;
    }
    async getPaymentStatuses() {
        if (this.paymentStatuses.length === 0) {
            await this.loadData();
        }
        return this.paymentStatuses;
    }
    async getPayments(options) {
        await this.loadData();
        if (options === null || options === void 0 ? void 0 : options.isHistoryPage) {
            return this.paymentStatuses.filter(payment => payment.status === '已收款');
        }
        return this.paymentStatuses;
    }
    async createPayment(payment) {
        await this.loadData();
        const newPayment = {
            ...payment,
            id: (0, uuid_1.v4)()
        };
        this.paymentStatuses.push(newPayment);
        await storageService_1.storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);
        return newPayment;
    }
    async updatePayment(id, updatedPayment) {
        await this.loadData();
        const index = this.paymentStatuses.findIndex(p => p.id === id);
        if (index === -1)
            return null;
        const oldPayment = this.paymentStatuses[index];
        this.paymentStatuses[index] = updatedPayment;
        await storageService_1.storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);
        // 只有當狀態變更為"已收款"時才新增歷史記錄
        if (updatedPayment.status === '已收款' && oldPayment.status !== '已收款') {
            await this.addHistory({
                paymentId: updatedPayment.id,
                memberId: updatedPayment.memberId,
                memberName: updatedPayment.memberName,
                memberType: updatedPayment.memberType,
                action: updatedPayment.status,
                amount: updatedPayment.amount,
                date: new Date().toISOString().split('T')[0],
                dueDate: updatedPayment.dueDate,
                paymentDate: updatedPayment.paidDate,
                status: updatedPayment.status,
                note: updatedPayment.note || '',
                userId: updatedPayment.memberId,
                userName: updatedPayment.memberName,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        return updatedPayment;
    }
    async deletePayment(id) {
        await this.loadData();
        const payment = this.paymentStatuses.find(p => p.id === id);
        if (!payment)
            return false;
        // 刪除付款記錄
        this.paymentStatuses = this.paymentStatuses.filter(p => p.id !== id);
        await storageService_1.storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);
        // 刪除相關的歷史記錄
        const histories = await storageService_1.storageService.getData('fee_history') || [];
        const updatedHistories = histories.filter(h => h.paymentId !== id);
        await storageService_1.storageService.updateData('fee_history', updatedHistories);
        return true;
    }
    async addHistory(data) {
        await feeHistoryService_1.feeHistoryService.addHistory(data);
    }
    async addFeeSetting(setting) {
        await this.loadData();
        this.feeSettings.push(setting);
        await storageService_1.storageService.updateData(FEE_SETTINGS_KEY, this.feeSettings);
    }
    async updateFeeSetting(id, updates) {
        await this.loadData();
        const index = this.feeSettings.findIndex(s => s.id === id);
        if (index !== -1) {
            this.feeSettings[index] = { ...this.feeSettings[index], ...updates };
            await storageService_1.storageService.updateData(FEE_SETTINGS_KEY, this.feeSettings);
        }
    }
    async deleteFeeSetting(id) {
        await this.loadData();
        this.feeSettings = this.feeSettings.filter(s => s.id !== id);
        await storageService_1.storageService.updateData(FEE_SETTINGS_KEY, this.feeSettings);
    }
    async addPaymentStatus(status) {
        await this.loadData();
        this.paymentStatuses.push(status);
        await storageService_1.storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);
    }
    async updatePaymentStatus(id, updates) {
        await this.loadData();
        const index = this.paymentStatuses.findIndex(s => s.id === id);
        if (index !== -1) {
            this.paymentStatuses[index] = { ...this.paymentStatuses[index], ...updates };
            await storageService_1.storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);
        }
    }
    async deletePaymentStatus(id) {
        await this.loadData();
        this.paymentStatuses = this.paymentStatuses.filter(s => s.id !== id);
        await storageService_1.storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);
    }
    async initialize() {
        const settings = await storageService_1.storageService.getData(FEE_SETTINGS_KEY);
        const status = await storageService_1.storageService.getData(PAYMENT_STATUS_KEY);
        if (!settings || settings.length === 0) {
            // 設定預設的會費標準
            const defaultSettings = [
                {
                    id: '1',
                    name: '一般會員年費',
                    description: '一般會員年費',
                    amount: 30000,
                    frequency: 'yearly',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    name: '商務會員年費',
                    description: '商務會員年費',
                    amount: 300000,
                    frequency: 'yearly',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '3',
                    name: '永久會員5年費用',
                    description: '永久會員5年費用',
                    amount: 3000000,
                    frequency: 'yearly',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '4',
                    name: '管理員免費',
                    description: '管理員免費',
                    amount: 0,
                    frequency: 'yearly',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            await storageService_1.storageService.updateData(FEE_SETTINGS_KEY, defaultSettings);
        }
        if (!status) {
            // 初始化空的付款狀態列表
            await storageService_1.storageService.updateData(PAYMENT_STATUS_KEY, []);
        }
        await this.loadData();
    }
}
// 建立單一實例並導出
const instance = new FeeService();
exports.feeService = instance;
instance.initialize().catch(error => {
    console.error('初始化 feeService 失敗:', error);
});
