import { v4 as uuidv4 } from 'uuid';
import { FeeSetting, PaymentStatusRecord, FeeHistory, PaymentStatus } from '../types/fee';
import { storageService } from './storageService';
import { feeHistoryService } from './feeHistoryService';

const FEE_SETTINGS_KEY = 'feeSettings';
const PAYMENT_STATUS_KEY = 'paymentStatuses';

class FeeService {
    private feeSettings: FeeSetting[] = [];
    private paymentStatuses: PaymentStatusRecord[] = [];

    constructor() {
        this.loadData();
    }

    private async loadData(): Promise<void> {
        const settings = await storageService.getData<FeeSetting[]>(FEE_SETTINGS_KEY);
        const status = await storageService.getData<PaymentStatusRecord[]>(PAYMENT_STATUS_KEY);

        if (settings) {
            this.feeSettings = settings;
        }

        if (status) {
            this.paymentStatuses = status;
        }
    }

    async getFeeSettings(): Promise<FeeSetting[]> {
        if (this.feeSettings.length === 0) {
            await this.loadData();
        }
        return this.feeSettings;
    }

    async getPaymentStatuses(): Promise<PaymentStatusRecord[]> {
        if (this.paymentStatuses.length === 0) {
            await this.loadData();
        }
        return this.paymentStatuses;
    }

    async getPayments(options?: { isHistoryPage?: boolean }): Promise<PaymentStatusRecord[]> {
        await this.loadData();
        if (options?.isHistoryPage) {
            return this.paymentStatuses.filter(payment => payment.status === '已收款');
        }
        return this.paymentStatuses;
    }

    async createPayment(payment: {
        memberId: string;
        memberName: string;
        memberType: string;
        amount: number;
        dueDate: string;
        status: PaymentStatus;
        note?: string;
        feeSettingId?: string;
    }): Promise<PaymentStatusRecord> {
        await this.loadData();
        const newPayment: PaymentStatusRecord = {
            ...payment,
            id: uuidv4()
        };
        this.paymentStatuses.push(newPayment);
        await storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);
        return newPayment;
    }

    async updatePayment(id: string, updatedPayment: PaymentStatusRecord): Promise<PaymentStatusRecord | null> {
        await this.loadData();
        const index = this.paymentStatuses.findIndex(p => p.id === id);
        if (index === -1) return null;

        const oldPayment = this.paymentStatuses[index];
        this.paymentStatuses[index] = updatedPayment;
        await storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);

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

    async deletePayment(id: string): Promise<boolean> {
        await this.loadData();
        const payment = this.paymentStatuses.find(p => p.id === id);
        if (!payment) return false;

        // 刪除付款記錄
        this.paymentStatuses = this.paymentStatuses.filter(p => p.id !== id);
        await storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);

        // 刪除相關的歷史記錄
        const histories = await storageService.getData<FeeHistory[]>('fee_history') || [];
        const updatedHistories = histories.filter(h => h.paymentId !== id);
        await storageService.updateData('fee_history', updatedHistories);

        return true;
    }

    private async addHistory(data: Omit<FeeHistory, 'id'>): Promise<void> {
        await feeHistoryService.addHistory(data);
    }

    async addFeeSetting(setting: FeeSetting): Promise<void> {
        await this.loadData();
        this.feeSettings.push(setting);
        await storageService.updateData(FEE_SETTINGS_KEY, this.feeSettings);
    }

    async updateFeeSetting(id: string, updates: Partial<FeeSetting>): Promise<void> {
        await this.loadData();
        const index = this.feeSettings.findIndex(s => s.id === id);
        if (index !== -1) {
            this.feeSettings[index] = { ...this.feeSettings[index], ...updates };
            await storageService.updateData(FEE_SETTINGS_KEY, this.feeSettings);
        }
    }

    async deleteFeeSetting(id: string): Promise<void> {
        await this.loadData();
        this.feeSettings = this.feeSettings.filter(s => s.id !== id);
        await storageService.updateData(FEE_SETTINGS_KEY, this.feeSettings);
    }

    async addPaymentStatus(status: PaymentStatusRecord): Promise<void> {
        await this.loadData();
        this.paymentStatuses.push(status);
        await storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);
    }

    async updatePaymentStatus(id: string, updates: Partial<PaymentStatusRecord>): Promise<void> {
        await this.loadData();
        const index = this.paymentStatuses.findIndex(s => s.id === id);
        if (index !== -1) {
            this.paymentStatuses[index] = { ...this.paymentStatuses[index], ...updates };
            await storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);
        }
    }

    async deletePaymentStatus(id: string): Promise<void> {
        await this.loadData();
        this.paymentStatuses = this.paymentStatuses.filter(s => s.id !== id);
        await storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);
    }

    async initialize(): Promise<void> {
        const settings = await storageService.getData<FeeSetting[]>(FEE_SETTINGS_KEY);
        const status = await storageService.getData<PaymentStatusRecord[]>(PAYMENT_STATUS_KEY);

        if (!settings || settings.length === 0) {
            // 設定預設的會費標準
            const defaultSettings: FeeSetting[] = [
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
                    name: '永久會員5年費用',
                    description: '永久會員5年費用',
                    amount: 300000,
                    frequency: '5year',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '3',
                    name: '商務會員5年費用',
                    description: '商務會員5年費用',
                    amount: 3000000,
                    frequency: '5year',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '4',
                    name: '管理員免費',
                    description: '管理員免費',
                    amount: 0,
                    frequency: 'forever',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            await storageService.updateData(FEE_SETTINGS_KEY, defaultSettings);
        }

        if (!status) {
            // 初始化空的付款狀態列表
            await storageService.updateData(PAYMENT_STATUS_KEY, []);
        }

        await this.loadData();
    }
}

// 建立單一實例並導出
const instance = new FeeService();
instance.initialize().catch(error => {
    console.error('初始化 feeService 失敗:', error);
});
export { instance as feeService }; 