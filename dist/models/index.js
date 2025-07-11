"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fee = exports.InvoiceType = exports.Invoice = exports.ProfitSharingType = exports.MemberProfit = exports.ProfitSharingStandard = exports.PaymentMethod = exports.PaymentStatus = exports.RentalPayment = exports.RentalStandard = exports.InvestmentType = exports.InvestmentStatus = exports.Investment = exports.IndustryType = exports.Company = exports.UserStatus = exports.UserRole = exports.User = exports.sequelize = void 0;
const User_1 = __importStar(require("./User"));
exports.User = User_1.default;
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return User_1.UserRole; } });
Object.defineProperty(exports, "UserStatus", { enumerable: true, get: function () { return User_1.UserStatus; } });
const Company_1 = __importStar(require("./Company"));
exports.Company = Company_1.default;
Object.defineProperty(exports, "IndustryType", { enumerable: true, get: function () { return Company_1.IndustryType; } });
const Investment_1 = __importStar(require("./Investment"));
exports.Investment = Investment_1.default;
Object.defineProperty(exports, "InvestmentStatus", { enumerable: true, get: function () { return Investment_1.InvestmentStatus; } });
Object.defineProperty(exports, "InvestmentType", { enumerable: true, get: function () { return Investment_1.InvestmentType; } });
const Rental_1 = require("./Rental");
Object.defineProperty(exports, "RentalStandard", { enumerable: true, get: function () { return Rental_1.RentalStandard; } });
Object.defineProperty(exports, "RentalPayment", { enumerable: true, get: function () { return Rental_1.RentalPayment; } });
Object.defineProperty(exports, "PaymentStatus", { enumerable: true, get: function () { return Rental_1.PaymentStatus; } });
Object.defineProperty(exports, "PaymentMethod", { enumerable: true, get: function () { return Rental_1.PaymentMethod; } });
const ProfitSharing_1 = require("./ProfitSharing");
Object.defineProperty(exports, "ProfitSharingStandard", { enumerable: true, get: function () { return ProfitSharing_1.ProfitSharingStandard; } });
Object.defineProperty(exports, "MemberProfit", { enumerable: true, get: function () { return ProfitSharing_1.MemberProfit; } });
Object.defineProperty(exports, "ProfitSharingType", { enumerable: true, get: function () { return ProfitSharing_1.ProfitSharingType; } });
const Invoice_1 = __importStar(require("./Invoice"));
exports.Invoice = Invoice_1.default;
Object.defineProperty(exports, "InvoiceType", { enumerable: true, get: function () { return Invoice_1.InvoiceType; } });
const Fee_1 = __importDefault(require("./Fee"));
exports.Fee = Fee_1.default;
const connection_1 = __importDefault(require("../db/connection"));
exports.sequelize = connection_1.default;
// 設置模型關聯
// User 與 Company 關聯
User_1.default.belongsTo(Company_1.default, { foreignKey: 'companyId' });
Company_1.default.hasMany(User_1.default, { foreignKey: 'companyId' });
