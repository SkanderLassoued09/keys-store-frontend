import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategoryState } from './category.state';

export const selectCategoryState = createFeatureSelector<CategoryState>('category');
export const selectAllCategories = createSelector(selectCategoryState, (state) => state.categories);
export const selectActiveCategories = createSelector(selectAllCategories, (categories) => categories.filter((c) => c.active !== false));
export const selectCategoryLoading = createSelector(selectCategoryState, (state) => state.loading);
export const selectCategorySaving = createSelector(selectCategoryState, (state) => state.saving);
export const selectCategoryError = createSelector(selectCategoryState, (state) => state.error);
