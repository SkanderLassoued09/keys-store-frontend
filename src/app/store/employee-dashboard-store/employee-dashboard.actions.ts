import { createAction, props } from '@ngrx/store';
import { EmployeeAnalytics } from '@/layout/service/analytics.service';

export const loadEmployeeAnalytics = createAction('[Employee Dashboard] Load', props<{ startDate: string; endDate: string }>());
export const loadEmployeeAnalyticsSuccess = createAction('[Employee Dashboard] Load Success', props<{ employees: EmployeeAnalytics[] }>());
export const loadEmployeeAnalyticsFailure = createAction('[Employee Dashboard] Load Failure', props<{ error: string }>());
