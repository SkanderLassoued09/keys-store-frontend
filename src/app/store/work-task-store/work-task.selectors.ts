import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorkTaskState } from './work-task.state';

export const selectTaskState = createFeatureSelector<WorkTaskState>('workTask');
export const selectAllTasks = createSelector(selectTaskState, (state) => state.tasks);
export const selectTaskLoading = createSelector(selectTaskState, (state) => state.loading);
export const selectTaskSaving = createSelector(selectTaskState, (state) => state.saving);
export const selectTaskError = createSelector(selectTaskState, (state) => state.error);
