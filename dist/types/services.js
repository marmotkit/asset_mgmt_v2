"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareStatus = exports.CareType = exports.RegistrationStatus = exports.ActivityStatus = void 0;
var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus["PLANNING"] = "planning";
    ActivityStatus["REGISTRATION"] = "registration";
    ActivityStatus["ONGOING"] = "ongoing";
    ActivityStatus["COMPLETED"] = "completed";
    ActivityStatus["CANCELLED"] = "cancelled";
    ActivityStatus["HIDDEN"] = "hidden"; // 新增隱藏狀態
})(ActivityStatus || (exports.ActivityStatus = ActivityStatus = {}));
var RegistrationStatus;
(function (RegistrationStatus) {
    RegistrationStatus["PENDING"] = "pending";
    RegistrationStatus["CONFIRMED"] = "confirmed";
    RegistrationStatus["CANCELLED"] = "cancelled";
    RegistrationStatus["ATTENDED"] = "attended";
    RegistrationStatus["ABSENT"] = "absent";
})(RegistrationStatus || (exports.RegistrationStatus = RegistrationStatus = {}));
var CareType;
(function (CareType) {
    CareType["BIRTHDAY"] = "birthday";
    CareType["HOLIDAY"] = "holiday";
    CareType["ANNIVERSARY"] = "anniversary";
    CareType["CONDOLENCE"] = "condolence";
    CareType["CONGRATULATION"] = "congratulation";
    CareType["FOLLOW_UP"] = "follow_up";
    CareType["OTHER"] = "other";
})(CareType || (exports.CareType = CareType = {}));
var CareStatus;
(function (CareStatus) {
    CareStatus["PLANNED"] = "planned";
    CareStatus["PROCESSING"] = "processing";
    CareStatus["COMPLETED"] = "completed";
    CareStatus["CANCELLED"] = "cancelled";
})(CareStatus || (exports.CareStatus = CareStatus = {}));
