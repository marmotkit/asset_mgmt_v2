import { FeeSetting, FeeRecord, PaymentRecord, ExpirationReminder } from "../types/fee";

export const mockFeeData = {
  settings: [
    {
      id: "1",
      memberType: "一般會員",
      amount: 1000,
      period: "年",
      description: "基本會員年費"
    },
    {
      id: "2",
      memberType: "進階會員",
      amount: 100,
      period: "月",
      description: "進階會員月費"
    }
  ] as FeeSetting[],

  records: [
    {
      id: "1",
      userId: "user1",
      settingId: "1",
      amount: 1000,
      status: "pending",
      dueDate: new Date("2024-12-31"),
    },
    {
      id: "2",
      userId: "user2",
      settingId: "2",
      amount: 100,
      status: "paid",
      dueDate: new Date("2024-05-31"),
      paidDate: new Date("2024-05-01")
    }
  ] as FeeRecord[],

  paymentRecords: [
    {
      id: "1",
      feeId: "1",
      memberId: "user1",
      memberName: "張三",
      year: 2024,
      amount: 1000,
      paymentDate: new Date("2024-01-01"),
      status: "paid",
      dueDate: new Date("2024-12-31"),
      remarks: "已繳納"
    }
  ] as PaymentRecord[],

  expirationReminders: [
    {
      id: "1",
      feeId: "1",
      memberId: "user1",
      memberName: "張三",
      memberType: "一般會員",
      dueDate: new Date("2024-12-31"),
      reminderDate: new Date("2024-12-01"),
      expirationDate: new Date("2024-12-31"),
      status: "pending",
      daysRemaining: 30,
      reminderSent: false
    }
  ] as ExpirationReminder[]
};
