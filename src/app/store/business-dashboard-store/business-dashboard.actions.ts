import { createAction, props } from '@ngrx/store';
import { BusinessAnalytics } from '@/layout/service/analytics.service';

export const loadBusinessAnalytics = createAction('[Business Dashboard] Load', props<{ startDate: string; endDate: string }>());
export const loadBusinessAnalyticsSuccess = createAction('[Business Dashboard] Load Success', props<{ data: BusinessAnalytics }>());
export const loadBusinessAnalyticsFailure = createAction('[Business Dashboard] Load Failure', props<{ error: string }>());
