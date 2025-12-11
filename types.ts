export interface User {
    chat_id: number;
    profile_data: {
        name: string;
        address: string;
    };
    auth_data: {
        mobile_number: string;
        aadhaar_number: string;
    };
    verification_status: {
        is_mobile_verified: boolean;
        is_aadhaar_verified: boolean;
    };
    created_at: string;
}

export interface Complaint {
    id: string;
    created_at: string;
    complaint_type: string;
    status: string;
    user_id?: string;
    description?: string;
    location?: string;
    updated_at?: string;
}

export interface RTIRequest {
    id: string;
    created_at: string;
    status: string;
}

export interface Stats {
    totalUsers: number;
    totalComplaints: number;
    openComplaints: number;
    closedComplaints: number;
    totalRTI: number;
}

export interface MonthlyData {
    name: string;
    complaints: number;
    rti: number;
}

export interface CategoryData {
    name: string;
    value: number;
    [key: string]: string | number;
}

export interface StatusData {
    name: string;
    value: number;
}

export interface RecentActivity {
    id: string;
    created_at: string;
    type: 'complaint' | 'rti';
    title: string;
    status?: string;
    complaint_type?: string;
}

