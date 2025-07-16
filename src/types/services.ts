export enum ActivityStatus {
    PLANNING = 'planning',
    REGISTRATION = 'registration',
    ONGOING = 'ongoing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    HIDDEN = 'hidden' // 新增隱藏狀態
}

export enum RegistrationStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    ATTENDED = 'attended',
    ABSENT = 'absent'
}

export enum CareType {
    BIRTHDAY = 'birthday',
    HOLIDAY = 'holiday',
    ANNIVERSARY = 'anniversary',
    CONDOLENCE = 'condolence',
    CONGRATULATION = 'congratulation',
    FOLLOW_UP = 'follow_up',
    OTHER = 'other'
}

export enum CareStatus {
    PLANNED = 'planned',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface AnnualActivity {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    capacity: number;
    registrationDeadline: string;
    status: ActivityStatus;
    year: number;
    coverImage?: string;
    isVisible: boolean; // 新增顯示/隱藏狀態
    createdAt: string;
    updatedAt: string;
}

export interface ActivityRegistration {
    id: string;
    activityId: string;
    memberId: string;
    registrationDate: string;
    status: RegistrationStatus;
    notes: string;
    companions: number;
    specialRequests?: string;
    memberName?: string; // 新增
    phoneNumber?: string; // 新增
    totalParticipants?: number; // 新增
    maleCount?: number; // 新增
    femaleCount?: number; // 新增
    createdAt: string;
    updatedAt: string;
}

// 新增活動報名表單類型
export interface ActivityRegistrationForm {
    activityId: string;
    memberName: string;
    totalParticipants: number;
    maleCount: number;
    femaleCount: number;
    phoneNumber: string;
    notes?: string;
}

// 新增活動報名詳細資訊類型
export interface ActivityRegistrationDetail extends ActivityRegistration {
    memberName: string;
    phoneNumber: string;
    maleCount: number;
    femaleCount: number;
    totalParticipants: number;
    activityTitle: string;
    activityDate: string;
    activityLocation: string;
}

// 新增活動統計資訊類型
export interface ActivityStatistics {
    activityId: string;
    activityTitle: string;
    totalRegistrations: number;
    confirmedRegistrations: number;
    totalParticipants: number;
    maleCount: number;
    femaleCount: number;
    registrationRate: number; // 報名率
    capacity: number;
    status: ActivityStatus;
}

export interface MemberCare {
    id: string;
    memberId: string;
    type: CareType;
    title: string;
    description: string;
    date: string;
    status: CareStatus;
    assignedTo?: string; // 負責人員的 ID
    followUpDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
} 