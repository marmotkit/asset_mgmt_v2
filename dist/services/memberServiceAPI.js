"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberServiceAPI = void 0;
const services_1 = require("../types/services");
class MemberServiceAPI {
    // 初始化函數，從本地存儲加載數據
    static initialize() {
        this.loadActivitiesFromStorage();
        this.loadRegistrationsFromStorage();
        this.loadMemberCaresFromStorage();
    }
    // 年度活動相關方法
    static async getActivities(year, status) {
        this.loadActivitiesFromStorage();
        let filtered = [...this.activities];
        if (year) {
            filtered = filtered.filter(activity => activity.year === year);
        }
        if (status) {
            filtered = filtered.filter(activity => activity.status === status);
        }
        return Promise.resolve(filtered);
    }
    static async getActivity(id) {
        this.loadActivitiesFromStorage();
        const activity = this.activities.find(a => a.id === id);
        return Promise.resolve(activity || null);
    }
    static async createActivity(data) {
        this.loadActivitiesFromStorage();
        const newActivity = {
            id: crypto.randomUUID(),
            title: data.title || '',
            description: data.description || '',
            startDate: data.startDate || new Date().toISOString(),
            endDate: data.endDate || new Date().toISOString(),
            location: data.location || '',
            capacity: data.capacity || 0,
            registrationDeadline: data.registrationDeadline || new Date().toISOString(),
            status: data.status || services_1.ActivityStatus.PLANNING,
            year: data.year || new Date().getFullYear(),
            coverImage: data.coverImage,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.activities.push(newActivity);
        this.saveActivitiesToStorage();
        return Promise.resolve(newActivity);
    }
    static async updateActivity(id, data) {
        this.loadActivitiesFromStorage();
        const index = this.activities.findIndex(a => a.id === id);
        if (index === -1) {
            throw new Error('找不到指定的活動');
        }
        const updatedActivity = {
            ...this.activities[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        this.activities[index] = updatedActivity;
        this.saveActivitiesToStorage();
        return Promise.resolve(updatedActivity);
    }
    static async deleteActivity(id) {
        this.loadActivitiesFromStorage();
        const index = this.activities.findIndex(a => a.id === id);
        if (index === -1) {
            throw new Error('找不到指定的活動');
        }
        // 同時刪除相關的報名記錄
        this.loadRegistrationsFromStorage();
        this.registrations = this.registrations.filter(r => r.activityId !== id);
        this.saveRegistrationsToStorage();
        this.activities.splice(index, 1);
        this.saveActivitiesToStorage();
        return Promise.resolve();
    }
    // 活動報名相關方法
    static async getRegistrations(activityId, memberId) {
        this.loadRegistrationsFromStorage();
        let filtered = [...this.registrations];
        if (activityId) {
            filtered = filtered.filter(reg => reg.activityId === activityId);
        }
        if (memberId) {
            filtered = filtered.filter(reg => reg.memberId === memberId);
        }
        return Promise.resolve(filtered);
    }
    static async getRegistration(id) {
        this.loadRegistrationsFromStorage();
        const registration = this.registrations.find(r => r.id === id);
        return Promise.resolve(registration || null);
    }
    static async createRegistration(data) {
        this.loadRegistrationsFromStorage();
        this.loadActivitiesFromStorage();
        if (!data.activityId) {
            throw new Error('必須指定活動 ID');
        }
        if (!data.memberId) {
            throw new Error('必須指定會員 ID');
        }
        // 檢查活動是否存在
        const activity = this.activities.find(a => a.id === data.activityId);
        if (!activity) {
            throw new Error('活動不存在');
        }
        // 檢查是否已經報名
        const existingReg = this.registrations.find(r => r.activityId === data.activityId && r.memberId === data.memberId);
        if (existingReg) {
            throw new Error('已經報名過此活動');
        }
        // 檢查活動是否已滿員
        const currentRegistrations = this.registrations.filter(r => r.activityId === data.activityId &&
            (r.status === services_1.RegistrationStatus.CONFIRMED || r.status === services_1.RegistrationStatus.PENDING));
        const companions = currentRegistrations.reduce((sum, reg) => sum + (reg.companions || 0), 0);
        const totalParticipants = currentRegistrations.length + companions;
        if (totalParticipants >= activity.capacity) {
            throw new Error('活動已達報名上限');
        }
        // 創建報名記錄
        const newRegistration = {
            id: crypto.randomUUID(),
            activityId: data.activityId,
            memberId: data.memberId,
            registrationDate: new Date().toISOString(),
            status: data.status || services_1.RegistrationStatus.PENDING,
            notes: data.notes || '',
            companions: data.companions || 0,
            specialRequests: data.specialRequests,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.registrations.push(newRegistration);
        this.saveRegistrationsToStorage();
        return Promise.resolve(newRegistration);
    }
    static async updateRegistration(id, data) {
        this.loadRegistrationsFromStorage();
        const index = this.registrations.findIndex(r => r.id === id);
        if (index === -1) {
            throw new Error('找不到指定的報名記錄');
        }
        const updatedRegistration = {
            ...this.registrations[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        this.registrations[index] = updatedRegistration;
        this.saveRegistrationsToStorage();
        return Promise.resolve(updatedRegistration);
    }
    static async deleteRegistration(id) {
        this.loadRegistrationsFromStorage();
        const index = this.registrations.findIndex(r => r.id === id);
        if (index === -1) {
            throw new Error('找不到指定的報名記錄');
        }
        this.registrations.splice(index, 1);
        this.saveRegistrationsToStorage();
        return Promise.resolve();
    }
    // 會員關懷相關方法
    static async getMemberCares(memberId, type, status) {
        this.loadMemberCaresFromStorage();
        let filtered = [...this.memberCares];
        if (memberId) {
            filtered = filtered.filter(care => care.memberId === memberId);
        }
        if (type) {
            filtered = filtered.filter(care => care.type === type);
        }
        if (status) {
            filtered = filtered.filter(care => care.status === status);
        }
        return Promise.resolve(filtered);
    }
    static async getMemberCare(id) {
        this.loadMemberCaresFromStorage();
        const care = this.memberCares.find(c => c.id === id);
        return Promise.resolve(care || null);
    }
    static async createMemberCare(data) {
        this.loadMemberCaresFromStorage();
        if (!data.memberId) {
            throw new Error('必須指定會員 ID');
        }
        const newCare = {
            id: crypto.randomUUID(),
            memberId: data.memberId,
            type: data.type || services_1.CareType.OTHER,
            title: data.title || '',
            description: data.description || '',
            date: data.date || new Date().toISOString(),
            status: data.status || services_1.CareStatus.PLANNED,
            assignedTo: data.assignedTo,
            followUpDate: data.followUpDate,
            notes: data.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.memberCares.push(newCare);
        this.saveMemberCaresToStorage();
        return Promise.resolve(newCare);
    }
    static async updateMemberCare(id, data) {
        this.loadMemberCaresFromStorage();
        const index = this.memberCares.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('找不到指定的會員關懷記錄');
        }
        const updatedCare = {
            ...this.memberCares[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        this.memberCares[index] = updatedCare;
        this.saveMemberCaresToStorage();
        return Promise.resolve(updatedCare);
    }
    static async deleteMemberCare(id) {
        this.loadMemberCaresFromStorage();
        const index = this.memberCares.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('找不到指定的會員關懷記錄');
        }
        this.memberCares.splice(index, 1);
        this.saveMemberCaresToStorage();
        return Promise.resolve();
    }
    // 存儲相關方法
    static loadActivitiesFromStorage() {
        const stored = localStorage.getItem('annual_activities');
        if (stored) {
            try {
                this.activities = JSON.parse(stored);
            }
            catch (error) {
                console.error('解析年度活動數據時發生錯誤:', error);
                this.activities = [];
            }
        }
    }
    static saveActivitiesToStorage() {
        localStorage.setItem('annual_activities', JSON.stringify(this.activities));
    }
    static loadRegistrationsFromStorage() {
        const stored = localStorage.getItem('activity_registrations');
        if (stored) {
            try {
                this.registrations = JSON.parse(stored);
            }
            catch (error) {
                console.error('解析活動報名數據時發生錯誤:', error);
                this.registrations = [];
            }
        }
    }
    static saveRegistrationsToStorage() {
        localStorage.setItem('activity_registrations', JSON.stringify(this.registrations));
    }
    static loadMemberCaresFromStorage() {
        const stored = localStorage.getItem('member_cares');
        if (stored) {
            try {
                this.memberCares = JSON.parse(stored);
            }
            catch (error) {
                console.error('解析會員關懷數據時發生錯誤:', error);
                this.memberCares = [];
            }
        }
    }
    static saveMemberCaresToStorage() {
        localStorage.setItem('member_cares', JSON.stringify(this.memberCares));
    }
}
exports.MemberServiceAPI = MemberServiceAPI;
MemberServiceAPI.activities = [];
MemberServiceAPI.registrations = [];
MemberServiceAPI.memberCares = [];
