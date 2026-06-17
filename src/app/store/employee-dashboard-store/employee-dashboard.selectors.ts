import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmployeeDashboardState } from './employee-dashboard.state';

export const selectDashboardState = createFeatureSelector<EmployeeDashboardState>('employeeDashboard');
export const selectDashboardEmployees = createSelector(selectDashboardState, (state) => state.employees);
export const selectDashboardLoading = createSelector(selectDashboardState, (state) => state.loading);
export const selectDashboardDateRange = createSelector(selectDashboardState, (state) => state.dateRange);
export const selectDashboardError = createSelector(selectDashboardState, (state) => state.error);

// Roll-up totals across all employees for the header summary strip.
export const selectDashboardTotals = createSelector(selectDashboardEmployees, (employees) => ({
    totalRevenue: round(employees.reduce((s, e) => s + (e.totalEarned || 0), 0)),
    totalBonus: round(employees.reduce((s, e) => s + (e.bonus || 0), 0)),
    totalAdvances: round(employees.reduce((s, e) => s + (e.advancesTaken || 0), 0)),
    totalWorkOrders: employees.reduce((s, e) => s + (e.workOrdersCount || 0), 0)
}));

function round(v: number): number {
    return Math.round(v * 1000) / 1000;
}
