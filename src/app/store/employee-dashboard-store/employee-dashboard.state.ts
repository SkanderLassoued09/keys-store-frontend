import { EmployeeAnalytics } from '@/layout/service/analytics.service';

export interface EmployeeDashboardState {
    loading: boolean;
    dateRange: { startDate: string | null; endDate: string | null };
    employees: EmployeeAnalytics[];
    error: string | null;
}

export const initialState: EmployeeDashboardState = {
    loading: false,
    dateRange: { startDate: null, endDate: null },
    employees: [],
    error: null
};
