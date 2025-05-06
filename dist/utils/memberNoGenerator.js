"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMemberNo = exports.USER_ROLE_PREFIX = void 0;
exports.USER_ROLE_PREFIX = {
    normal: 'C',
    business: 'B',
    lifetime: 'L',
    admin: 'A'
};
const generateMemberNo = async (role, currentCount) => {
    const prefix = exports.USER_ROLE_PREFIX[role];
    const paddedCount = String(currentCount + 1).padStart(3, '0');
    return `${prefix}${paddedCount}`;
};
exports.generateMemberNo = generateMemberNo;
