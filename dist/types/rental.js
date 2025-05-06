"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = exports.PaymentStatus = exports.ProfitSharingType = void 0;
// 分潤標準設定
var ProfitSharingType;
(function (ProfitSharingType) {
    ProfitSharingType["PERCENTAGE"] = "percentage";
    ProfitSharingType["FIXED_AMOUNT"] = "fixed_amount";
    ProfitSharingType["OTHER"] = "other";
})(ProfitSharingType || (exports.ProfitSharingType = ProfitSharingType = {}));
// 租金收款項目
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["OVERDUE"] = "overdue";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["LINE_PAY"] = "line_pay";
    PaymentMethod["CHECK"] = "check";
    PaymentMethod["OTHER"] = "other";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
