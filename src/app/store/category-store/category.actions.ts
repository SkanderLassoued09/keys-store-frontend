import { createAction, props } from '@ngrx/store';
import { Category } from '@/layout/service/category.service';

export const loadCategories = createAction('[Category] Load');
export const loadCategoriesSuccess = createAction('[Category] Load Success', props<{ categories: Category[] }>());
export const loadCategoriesFailure = createAction('[Category] Load Failure', props<{ error: string }>());

export const createCategory = createAction('[Category] Create', props<{ payload: Partial<Category> }>());
export const createCategorySuccess = createAction('[Category] Create Success', props<{ category: Category }>());
export const createCategoryFailure = createAction('[Category] Create Failure', props<{ error: string }>());

export const updateCategory = createAction('[Category] Update', props<{ id: string; payload: Partial<Category> }>());
export const updateCategorySuccess = createAction('[Category] Update Success', props<{ category: Category }>());
export const updateCategoryFailure = createAction('[Category] Update Failure', props<{ error: string }>());

export const deleteCategory = createAction('[Category] Delete', props<{ id: string }>());
export const deleteCategorySuccess = createAction('[Category] Delete Success', props<{ id: string }>());
export const deleteCategoryFailure = createAction('[Category] Delete Failure', props<{ error: string }>());
