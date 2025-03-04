import { Member } from '../types/member';

class MemberService {
    private members: Member[] = [];

    async getMembers(): Promise<Member[]> {
        // TODO: 實際環境中應該從 API 獲取資料
        return this.members;
    }

    async getMemberById(memberId: string): Promise<Member | undefined> {
        const members = await this.getMembers();
        return members.find(member => member.id === memberId);
    }
}

export const memberService = new MemberService(); 