import { createReducer, on } from '@ngrx/store';
import { initialState } from './employee-dashboard.state';
import * as DashboardActions from './employee-dashboard.actions';

export const employeeDashboardReducer = createReducer(
    initialState,

    on(DashboardActions.loadEmployeeAnalytics, (state, { startDate, endDate }) => ({
        ...state,
        loading: true,
        dateRange: { startDate, endDate },
        error: null
    })),
    on(DashboardActions.loadEmployeeAnalyticsSuccess, (state, { employees }) => ({
        ...state,
        employees,
        loading: false,
        error: null
    })),
    on(DashboardActions.loadEmployeeAnalyticsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
);
