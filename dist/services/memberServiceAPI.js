"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberServiceAPI = void 0;
class MemberServiceAPI {
    // 年度活動相關方法
    static async getActivities(year, status) {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (year)
                params.append('year', year.toString());
            if (status)
                params.append('status', status);
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/annual-activities?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('載入年度活動失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('獲取年度活動失敗:', error);
            throw error;
        }
    }
    static async getActivity(id) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/annual-activities/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('載入活動詳情失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('獲取活動詳情失敗:', error);
            throw error;
        }
    }
    static async createActivity(data) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://asset-mgmt-api-clean.onrender.com/api/annual-activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('建立活動失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('建立活動失敗:', error);
            throw error;
        }
    }
    static async updateActivity(id, data) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/annual-activities/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('更新活動失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('更新活動失敗:', error);
            throw error;
        }
    }
    static async deleteActivity(id) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/annual-activities/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('刪除活動失敗');
            }
        }
        catch (error) {
            console.error('刪除活動失敗:', error);
            throw error;
        }
    }
    // 活動報名相關方法
    static async getRegistrations(activityId, memberId) {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (activityId)
                params.append('activityId', activityId);
            if (memberId)
                params.append('memberId', memberId);
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/activity-registrations?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('載入活動報名記錄失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('獲取活動報名記錄失敗:', error);
            throw error;
        }
    }
    // 新增：獲取我的報名記錄
    static async getMyRegistrations() {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/activity-registrations?memberId=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('載入我的報名記錄失敗');
            }
            const data = await response.json();
            // 轉換為ActivityRegistrationDetail格式
            return data.map((item) => ({
                id: item.id,
                activityId: item.activity_id,
                memberId: item.member_id,
                registrationDate: item.registration_date,
                status: item.status,
                notes: item.notes,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
                memberName: item.member_name,
                phoneNumber: item.phone_number,
                maleCount: item.male_count,
                femaleCount: item.female_count,
                totalParticipants: item.total_participants,
                activityTitle: item.activity_title,
                activityDate: item.activity_date,
                activityLocation: item.activity_location
            }));
        }
        catch (error) {
            console.error('獲取我的報名記錄失敗:', error);
            throw error;
        }
    }
    // 新增：建立活動報名
    static async createActivityRegistration(data) {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await fetch('https://asset-mgmt-api-clean.onrender.com/api/activity-registrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...data,
                    memberId: user.id // 如果用戶已登入，關聯用戶ID
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '建立活動報名失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('建立活動報名失敗:', error);
            throw error;
        }
    }
    static async getRegistration(id) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/activity-registrations/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('載入報名記錄詳情失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('獲取報名記錄詳情失敗:', error);
            throw error;
        }
    }
    static async updateRegistration(id, data) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/activity-registrations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('更新活動報名失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('更新活動報名失敗:', error);
            throw error;
        }
    }
    static async deleteRegistration(id) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/activity-registrations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('刪除活動報名失敗');
            }
        }
        catch (error) {
            console.error('刪除活動報名失敗:', error);
            throw error;
        }
    }
    // 會員關懷相關方法
    static async getMemberCares(memberId, type, status) {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (memberId)
                params.append('memberId', memberId);
            if (type)
                params.append('type', type);
            if (status)
                params.append('status', status);
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/member-cares?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('載入會員關懷記錄失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('獲取會員關懷記錄失敗:', error);
            throw error;
        }
    }
    static async getMemberCare(id) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/member-cares/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('載入會員關懷記錄詳情失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('獲取會員關懷記錄詳情失敗:', error);
            throw error;
        }
    }
    static async createMemberCare(data) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://asset-mgmt-api-clean.onrender.com/api/member-cares', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('建立會員關懷記錄失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('建立會員關懷記錄失敗:', error);
            throw error;
        }
    }
    static async updateMemberCare(id, data) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/member-cares/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('更新會員關懷記錄失敗');
            }
            return await response.json();
        }
        catch (error) {
            console.error('更新會員關懷記錄失敗:', error);
            throw error;
        }
    }
    static async deleteMemberCare(id) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://asset-mgmt-api-clean.onrender.com/api/member-cares/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('刪除會員關懷記錄失敗');
            }
        }
        catch (error) {
            console.error('刪除會員關懷記錄失敗:', error);
            throw error;
        }
    }
}
exports.MemberServiceAPI = MemberServiceAPI;
