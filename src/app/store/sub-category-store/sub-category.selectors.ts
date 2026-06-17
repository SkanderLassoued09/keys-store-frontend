import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SubCategoryState } from './sub-category.state';

const refId = (value: any): string | null => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return typeof value._id === 'string' ? value._id : null;
};

export const selectSubCategoryState = createFeatureSelector<SubCategoryState>('subCategory');
export const selectAllSubCategories = createSelector(selectSubCategoryState, (state) => state.subCategories);
export const selectSubCategoryLoading = createSelector(selectSubCategoryState, (state) => state.loading);
export const selectSubCategorySaving = createSelector(selectSubCategoryState, (state) => state.saving);
export const selectSubCategoryError = createSelector(selectSubCategoryState, (state) => state.error);

// Active sub-categories belonging to the given category id. The `category`
// ref arrives as either a populated object or a raw id string.
export const selectSubCategoriesByCategory = (categoryId: string | null | undefined) =>
    createSelector(selectAllSubCategories, (subCategories) => (!categoryId ? [] : subCategories.filter((s) => s.active !== false && refId(s.category) === categoryId)));
