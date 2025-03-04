import { v4 as uuidv4 } from 'uuid';
import { FeeSetting, PaymentStatusRecord, FeeHistory } from '../types/fee';
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
        try {
            const settings = await storageService.getData<FeeSetting[]>(FEE_SETTINGS_KEY);
            const status = await storageService.getData<PaymentStatusRecord[]>(PAYMENT_STATUS_KEY);
            this.feeSettings = settings || [];
            this.paymentStatuses = status || [];
        } catch (error) {
            console.error('載入資料失敗:', error);
            this.feeSettings = [];
            this.paymentStatuses = [];
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

    async getPayments(): Promise<PaymentStatusRecord[]> {
        await this.loadData();
        return this.paymentStatuses;
    }

    async createPayment(payment: Omit<PaymentStatusRecord, 'id'>): Promise<PaymentStatusRecord> {
        await this.loadData();
        const newPayment = {
            ...payment,
            id: uuidv4()
        };
        this.paymentStatuses.push(newPayment);
        await storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);

        // 新增歷史記錄
        await this.addHistory({
            paymentId: newPayment.id,
            memberId: newPayment.memberId,
            memberName: newPayment.memberName,
            memberType: newPayment.memberType,
            action: '待收款',
            amount: newPayment.amount,
            date: new Date().toISOString().split('T')[0],
            dueDate: newPayment.dueDate,
            status: newPayment.status,
            note: newPayment.note || '',
            userId: newPayment.memberId,
            userName: newPayment.memberName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return newPayment;
    }

    async updatePayment(id: string, updatedPayment: PaymentStatusRecord): Promise<PaymentStatusRecord | null> {
        await this.loadData();
        const index = this.paymentStatuses.findIndex(p => p.id === id);
        if (index === -1) return null;

        this.paymentStatuses[index] = updatedPayment;
        await storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);

        // 新增歷史記錄
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
        return updatedPayment;
    }

    async deletePayment(id: string): Promise<boolean> {
        await this.loadData();
        const payment = this.paymentStatuses.find(p => p.id === id);
        if (!payment) return false;

        this.paymentStatuses = this.paymentStatuses.filter(p => p.id !== id);
        await storageService.updateData(PAYMENT_STATUS_KEY, this.paymentStatuses);

        // 新增刪除記錄
        await this.addHistory({
            paymentId: payment.id,
            memberId: payment.memberId,
            memberName: payment.memberName,
            memberType: payment.memberType,
            action: '終止',
            amount: payment.amount,
            date: new Date().toISOString().split('T')[0],
            dueDate: payment.dueDate,
            status: payment.status,
            note: payment.note || '',
            userId: payment.memberId,
            userName: payment.memberName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
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
            const defaultFeeSettings: FeeSetting[] = [
                {
                    id: 'FS001',
                    name: '一般會員年費',
                    amount: 30000,
                    frequency: 'yearly',
                    description: '一般會員的年度會費'
                },
                {
                    id: 'FS002',
                    name: '商務會員年費',
                    amount: 300000,
                    frequency: 'yearly',
                    description: '商務會員的年度會費'
                },
                {
                    id: 'FS003',
                    name: '永久會員年費',
                    amount: 100000,
                    frequency: 'yearly',
                    description: '永久會員的年度會費'
                }
            ];
            await storageService.updateData(FEE_SETTINGS_KEY, defaultFeeSettings);
        }

        if (!status || status.length === 0) {
            // 設定預設的付款資料
            const defaultPayments: PaymentStatusRecord[] = [
                {
                    id: '1',
                    memberId: 'A001',
                    memberName: '系統管理員',
                    memberType: '一般會員',
                    amount: 30000,
                    dueDate: '2024-12-31',
                    status: '已收款',
                    paidDate: '2024-01-15',
                    note: '準時繳費'
                },
                {
                    id: '2',
                    memberId: 'V001',
                    memberName: '梁坤榮',
                    memberType: '商務會員',
                    amount: 300000,
                    dueDate: '2024-12-31',
                    status: '待收款',
                    note: ''
                }
            ];
            await storageService.updateData(PAYMENT_STATUS_KEY, defaultPayments);
        }
    }
}

// 建立單一實例並導出
const instance = new FeeService();
instance.initialize().catch(error => {
    console.error('初始化 feeService 失敗:', error);
});
export { instance as feeService }; 