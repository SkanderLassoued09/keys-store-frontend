import { createAction, props } from '@ngrx/store';
import { SubCategory } from '@/layout/service/sub-category.service';

export const loadSubCategories = createAction('[SubCategory] Load', props<{ categoryId?: string }>());
export const loadSubCategoriesSuccess = createAction('[SubCategory] Load Success', props<{ subCategories: SubCategory[] }>());
export const loadSubCategoriesFailure = createAction('[SubCategory] Load Failure', props<{ error: string }>());

export const createSubCategory = createAction('[SubCategory] Create', props<{ payload: Partial<SubCategory> }>());
export const createSubCategorySuccess = createAction('[SubCategory] Create Success', props<{ subCategory: SubCategory }>());
export const createSubCategoryFailure = createAction('[SubCategory] Create Failure', props<{ error: string }>());

export const updateSubCategory = createAction('[SubCategory] Update', props<{ id: string; payload: Partial<SubCategory> }>());
export const updateSubCategorySuccess = createAction('[SubCategory] Update Success', props<{ subCategory: SubCategory }>());
export const updateSubCategoryFailure = createAction('[SubCategory] Update Failure', props<{ error: string }>());

export const deleteSubCategory = createAction('[SubCategory] Delete', props<{ id: string }>());
export const deleteSubCategorySuccess = createAction('[SubCategory] Delete Success', props<{ id: string }>());
export const deleteSubCategoryFailure = createAction('[SubCategory] Delete Failure', props<{ error: string }>());
