import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BusinessDashboardState } from './business-dashboard.state';

export const selectBusinessState = createFeatureSelector<BusinessDashboardState>('businessDashboard');
export const selectBusinessData = createSelector(selectBusinessState, (state) => state.data);
export const selectBusinessLoading = createSelector(selectBusinessState, (state) => state.loading);
export const selectBusinessError = createSelector(selectBusinessState, (state) => state.error);
