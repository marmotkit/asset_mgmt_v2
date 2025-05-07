import { v4 as uuidv4 } from 'uuid';
import { AccountPayable, AccountReceivable, AccountRecord, MonthlyClosing, TransactionType } from '../types/payment';

// 模擬數據
let accountRecords: AccountRecord[] = [
    {
        id: '1',
        date: '2025-07-01',
        amount: 5000,
        type: 'income',
        category: '會費收入',
        paymentMethod: 'bank_transfer',
        description: '會員張三的年費',
        relatedParty: '張三',
        createdAt: '2025-07-01T08:00:00Z',
        updatedAt: '2025-07-01T08:00:00Z'
    },
    {
        id: '2',
        date: '2025-07-02',
        amount: 2000,
        type: 'expense',
        category: '辦公用品',
        paymentMethod: 'cash',
        description: '購買辦公文具及紙張',
        relatedParty: '文具店',
        createdAt: '2025-07-02T09:30:00Z',
        updatedAt: '2025-07-02T09:30:00Z'
    }
];

let accountReceivables: AccountReceivable[] = [
    {
        id: '1',
        date: '2025-07-01',
        dueDate: '2025-07-30',
        clientName: 'ABC公司',
        amount: 15000,
        status: 'pending',
        paidAmount: 0,
        description: '顧問服務費',
        invoiceNumber: 'INV-2025-001',
        createdAt: '2025-07-01T10:00:00Z',
        updatedAt: '2025-07-01T10:00:00Z'
    }
];

let accountPayables: AccountPayable[] = [
    {
        id: '1',
        date: '2025-07-05',
        dueDate: '2025-07-25',
        vendorName: 'XYZ供應商',
        amount: 8000,
        status: 'pending',
        paidAmount: 0,
        description: '設備維護費',
        invoiceNumber: 'XYZ-2025-042',
        createdAt: '2025-07-05T14:00:00Z',
        updatedAt: '2025-07-05T14:00:00Z'
    }
];

let monthlyClosings: MonthlyClosing[] = [
    {
        id: '1',
        year: 2025,
        month: 6,
        totalIncome: 50000,
        totalExpense: 30000,
        netAmount: 20000,
        status: 'finalized',
        closingDate: '2025-07-05T16:00:00Z',
        createdAt: '2025-07-05T16:00:00Z',
        updatedAt: '2025-07-05T16:00:00Z'
    }
];

// 帳務管理服務
export const accountingService = {
    // 日記帳功能
    getAccountRecords: async (): Promise<AccountRecord[]> => {
        // 模擬API調用延遲
        await new Promise(resolve => setTimeout(resolve, 500));
        return accountRecords;
    },

    getAccountRecord: async (id: string): Promise<AccountRecord | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return accountRecords.find(record => record.id === id);
    },

    addAccountRecord: async (record: Omit<AccountRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccountRecord> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const now = new Date().toISOString();
        const newRecord: AccountRecord = {
            ...record,
            id: uuidv4(),
            createdAt: now,
            updatedAt: now
        };
        accountRecords.push(newRecord);
        return newRecord;
    },

    updateAccountRecord: async (id: string, record: Partial<AccountRecord>): Promise<AccountRecord> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = accountRecords.findIndex(r => r.id === id);
        if (index === -1) {
            throw new Error('帳務記錄不存在');
        }
        const now = new Date().toISOString();
        accountRecords[index] = {
            ...accountRecords[index],
            ...record,
            updatedAt: now
        };
        return accountRecords[index];
    },

    deleteAccountRecord: async (id: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const initialLength = accountRecords.length;
        accountRecords = accountRecords.filter(record => record.id !== id);
        return accountRecords.length < initialLength;
    },

    // 應收帳款功能
    getReceivables: async (): Promise<AccountReceivable[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return accountReceivables;
    },

    getReceivable: async (id: string): Promise<AccountReceivable | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return accountReceivables.find(receivable => receivable.id === id);
    },

    addReceivable: async (receivable: Omit<AccountReceivable, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccountReceivable> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const now = new Date().toISOString();
        const newReceivable: AccountReceivable = {
            ...receivable,
            id: uuidv4(),
            createdAt: now,
            updatedAt: now
        };
        accountReceivables.push(newReceivable);
        return newReceivable;
    },

    updateReceivable: async (id: string, receivable: Partial<AccountReceivable>): Promise<AccountReceivable> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = accountReceivables.findIndex(r => r.id === id);
        if (index === -1) {
            throw new Error('應收帳款不存在');
        }
        const now = new Date().toISOString();
        accountReceivables[index] = {
            ...accountReceivables[index],
            ...receivable,
            updatedAt: now
        };
        return accountReceivables[index];
    },

    deleteReceivable: async (id: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const initialLength = accountReceivables.length;
        accountReceivables = accountReceivables.filter(receivable => receivable.id !== id);
        return accountReceivables.length < initialLength;
    },

    // 應付帳款功能
    getPayables: async (): Promise<AccountPayable[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return accountPayables;
    },

    getPayable: async (id: string): Promise<AccountPayable | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return accountPayables.find(payable => payable.id === id);
    },

    addPayable: async (payable: Omit<AccountPayable, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccountPayable> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const now = new Date().toISOString();
        const newPayable: AccountPayable = {
            ...payable,
            id: uuidv4(),
            createdAt: now,
            updatedAt: now
        };
        accountPayables.push(newPayable);
        return newPayable;
    },

    updatePayable: async (id: string, payable: Partial<AccountPayable>): Promise<AccountPayable> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = accountPayables.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('應付帳款不存在');
        }
        const now = new Date().toISOString();
        accountPayables[index] = {
            ...accountPayables[index],
            ...payable,
            updatedAt: now
        };
        return accountPayables[index];
    },

    deletePayable: async (id: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const initialLength = accountPayables.length;
        accountPayables = accountPayables.filter(payable => payable.id !== id);
        return accountPayables.length < initialLength;
    },

    // 月結功能
    getMonthlyClosings: async (): Promise<MonthlyClosing[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return monthlyClosings;
    },

    getMonthlyClosingDetail: async (id: string): Promise<MonthlyClosing | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return monthlyClosings.find(closing => closing.id === id);
    },

    createMonthlyClosing: async (data: { year: number, month: number }): Promise<MonthlyClosing> => {
        await new Promise(resolve => setTimeout(resolve, 800));

        // 檢查是否已存在
        const exists = monthlyClosings.some(
            closing => closing.year === data.year && closing.month === data.month
        );

        if (exists) {
            throw new Error('該月份的月結記錄已存在');
        }

        // 計算該月的收入和支出總額
        // 這裡用模擬數據，實際應用中需要從帳務記錄中計算
        const totalIncome = 50000 + Math.floor(Math.random() * 20000);
        const totalExpense = 30000 + Math.floor(Math.random() * 15000);
        const netAmount = totalIncome - totalExpense;

        const now = new Date().toISOString();
        const newClosing: MonthlyClosing = {
            id: uuidv4(),
            year: data.year,
            month: data.month,
            totalIncome,
            totalExpense,
            netAmount,
            status: 'pending',
            createdAt: now,
            updatedAt: now
        };

        monthlyClosings.push(newClosing);
        return newClosing;
    },

    finalizeMonthlyClosing: async (id: string): Promise<MonthlyClosing> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = monthlyClosings.findIndex(closing => closing.id === id);

        if (index === -1) {
            throw new Error('月結記錄不存在');
        }

        const now = new Date().toISOString();
        monthlyClosings[index] = {
            ...monthlyClosings[index],
            status: 'finalized',
            closingDate: now,
            updatedAt: now
        };

        return monthlyClosings[index];
    },

    // 財務報表
    getFinancialReport: async (params: { year: number, month?: number }) => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 模擬財務報表數據
        const monthData = [];
        const { year, month } = params;

        if (month) {
            // 返回特定月份的報表
            return {
                year,
                month,
                totalIncome: 50000 + Math.floor(Math.random() * 20000),
                totalExpense: 30000 + Math.floor(Math.random() * 15000),
                categories: {
                    income: [
                        { category: '會費收入', amount: 30000 + Math.floor(Math.random() * 10000) },
                        { category: '投資收入', amount: 15000 + Math.floor(Math.random() * 5000) },
                        { category: '其他收入', amount: 5000 + Math.floor(Math.random() * 2000) }
                    ],
                    expense: [
                        { category: '辦公支出', amount: 10000 + Math.floor(Math.random() * 3000) },
                        { category: '人事支出', amount: 15000 + Math.floor(Math.random() * 5000) },
                        { category: '其他支出', amount: 5000 + Math.floor(Math.random() * 2000) }
                    ]
                }
            };
        } else {
            // 返回整年的報表
            for (let i = 1; i <= 12; i++) {
                monthData.push({
                    month: i,
                    income: 40000 + Math.floor(Math.random() * 20000),
                    expense: 25000 + Math.floor(Math.random() * 15000)
                });
            }

            return {
                year,
                monthlyData: monthData,
                totalIncome: monthData.reduce((sum, data) => sum + data.income, 0),
                totalExpense: monthData.reduce((sum, data) => sum + data.expense, 0),
                categories: {
                    income: [
                        { category: '會費收入', amount: 350000 + Math.floor(Math.random() * 50000) },
                        { category: '投資收入', amount: 180000 + Math.floor(Math.random() * 30000) },
                        { category: '其他收入', amount: 60000 + Math.floor(Math.random() * 20000) }
                    ],
                    expense: [
                        { category: '辦公支出', amount: 120000 + Math.floor(Math.random() * 30000) },
                        { category: '人事支出', amount: 180000 + Math.floor(Math.random() * 40000) },
                        { category: '其他支出', amount: 60000 + Math.floor(Math.random() * 20000) }
                    ]
                }
            };
        }
    },

    getBalanceSheet: async (params: { date: string }) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        // 模擬資產負債表數據
        return {
            date: params.date,
            assets: {
                currentAssets: {
                    cash: 150000 + Math.floor(Math.random() * 50000),
                    accountsReceivable: 80000 + Math.floor(Math.random() * 30000),
                    inventory: 50000 + Math.floor(Math.random() * 20000),
                    total: 280000 + Math.floor(Math.random() * 100000)
                },
                nonCurrentAssets: {
                    property: 500000,
                    equipment: 200000 + Math.floor(Math.random() * 50000),
                    investments: 300000 + Math.floor(Math.random() * 100000),
                    total: 1000000 + Math.floor(Math.random() * 150000)
                },
                totalAssets: 1280000 + Math.floor(Math.random() * 200000)
            },
            liabilities: {
                currentLiabilities: {
                    accountsPayable: 70000 + Math.floor(Math.random() * 20000),
                    shortTermLoans: 50000 + Math.floor(Math.random() * 30000),
                    total: 120000 + Math.floor(Math.random() * 50000)
                },
                nonCurrentLiabilities: {
                    longTermLoans: 200000 + Math.floor(Math.random() * 50000),
                    total: 200000 + Math.floor(Math.random() * 50000)
                },
                totalLiabilities: 320000 + Math.floor(Math.random() * 100000)
            },
            equity: {
                capital: 500000,
                retainedEarnings: 460000 + Math.floor(Math.random() * 100000),
                totalEquity: 960000 + Math.floor(Math.random() * 100000)
            }
        };
    },

    getCashFlowStatement: async (params: { year: number, month?: number }) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        // 模擬現金流量表數據
        return {
            year: params.year,
            month: params.month,
            operatingActivities: {
                inflows: [
                    { description: '客戶收款', amount: 150000 + Math.floor(Math.random() * 50000) },
                    { description: '會費收入', amount: 50000 + Math.floor(Math.random() * 20000) }
                ],
                outflows: [
                    { description: '支付供應商', amount: -(70000 + Math.floor(Math.random() * 20000)) },
                    { description: '支付員工薪資', amount: -(85000 + Math.floor(Math.random() * 15000)) },
                    { description: '支付租金', amount: -(25000 + Math.floor(Math.random() * 5000)) },
                    { description: '支付稅款', amount: -(30000 + Math.floor(Math.random() * 10000)) }
                ],
                netCashFromOperating: 0 // 將在後面計算
            },
            investingActivities: {
                inflows: [
                    { description: '投資收益', amount: 30000 + Math.floor(Math.random() * 10000) }
                ],
                outflows: [
                    { description: '購買設備', amount: -(50000 + Math.floor(Math.random() * 20000)) }
                ],
                netCashFromInvesting: 0 // 將在後面計算
            },
            financingActivities: {
                inflows: [
                    { description: '借款收入', amount: 100000 + Math.floor(Math.random() * 50000) }
                ],
                outflows: [
                    { description: '償還借款', amount: -(60000 + Math.floor(Math.random() * 30000)) }
                ],
                netCashFromFinancing: 0 // 將在後面計算
            },
            netCashFlow: 0, // 將在後面計算
            startingCash: 120000 + Math.floor(Math.random() * 30000),
            endingCash: 0 // 將在後面計算
        };
    }
}; 