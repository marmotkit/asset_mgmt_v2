"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberService = void 0;
class MemberService {
    constructor() {
        this.members = [];
    }
    async getMembers() {
        // TODO: 實際環境中應該從 API 獲取資料
        return this.members;
    }
    async getMemberById(memberId) {
        const members = await this.getMembers();
        return members.find(member => member.id === memberId);
    }
}
exports.memberService = new MemberService();
