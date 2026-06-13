import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SettingsState } from './settings.state';

export const selectSettingsState = createFeatureSelector<SettingsState>('settings');
export const selectSettings = createSelector(selectSettingsState, (state) => state.settings);
export const selectSettingsLoading = createSelector(selectSettingsState, (state) => state.loading);
export const selectSettingsSaving = createSelector(selectSettingsState, (state) => state.saving);
export const selectSettingsError = createSelector(selectSettingsState, (state) => state.error);
export const selectServiceCommissionPercent = createSelector(selectSettings, (settings) => Number(settings?.serviceCommissionPercent ?? 0));
