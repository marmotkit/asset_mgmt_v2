export enum ActivityStatus {
    PLANNING = 'planning',
    REGISTRATION = 'registration',
    ONGOING = 'ongoing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
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
    createdAt: string;
    updatedAt: string;
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