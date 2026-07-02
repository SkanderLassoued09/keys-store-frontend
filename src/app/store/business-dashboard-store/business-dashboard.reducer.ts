import { createReducer, on } from '@ngrx/store';
import { initialState } from './business-dashboard.state';
import * as BusinessActions from './business-dashboard.actions';

export const businessDashboardReducer = createReducer(
    initialState,

    on(BusinessActions.loadBusinessAnalytics, (state, { startDate, endDate }) => ({
        ...state,
        loading: true,
        dateRange: { startDate, endDate },
        error: null
    })),
    on(BusinessActions.loadBusinessAnalyticsSuccess, (state, { data }) => ({
        ...state,
        data,
        loading: false,
        error: null
    })),
    on(BusinessActions.loadBusinessAnalyticsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
);
