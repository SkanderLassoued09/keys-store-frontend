import { BusinessAnalytics } from '@/layout/service/analytics.service';

export interface BusinessDashboardState {
    loading: boolean;
    dateRange: { startDate: string | null; endDate: string | null };
    data: BusinessAnalytics | null;
    error: string | null;
}

export const initialState: BusinessDashboardState = {
    loading: false,
    dateRange: { startDate: null, endDate: null },
    data: null,
    error: null
};
