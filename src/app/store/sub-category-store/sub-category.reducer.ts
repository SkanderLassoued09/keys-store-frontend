import { createReducer, on } from '@ngrx/store';
import { initialState } from './sub-category.state';
import * as SubCategoryActions from './sub-category.actions';

export const subCategoryReducer = createReducer(
    initialState,

    on(SubCategoryActions.loadSubCategories, (state) => ({ ...state, loading: true, error: null })),
    on(SubCategoryActions.loadSubCategoriesSuccess, (state, { subCategories }) => ({ ...state, subCategories, loading: false, error: null })),
    on(SubCategoryActions.loadSubCategoriesFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(SubCategoryActions.createSubCategory, (state) => ({ ...state, saving: true, error: null })),
    on(SubCategoryActions.createSubCategorySuccess, (state, { subCategory }) => ({ ...state, subCategories: [...state.subCategories, subCategory], saving: false, error: null })),
    on(SubCategoryActions.createSubCategoryFailure, (state, { error }) => ({ ...state, saving: false, error })),

    on(SubCategoryActions.updateSubCategory, (state) => ({ ...state, saving: true, error: null })),
    on(SubCategoryActions.updateSubCategorySuccess, (state, { subCategory }) => ({
        ...state,
        subCategories: state.subCategories.map((s) => (s._id === subCategory._id ? subCategory : s)),
        saving: false,
        error: null
    })),
    on(SubCategoryActions.updateSubCategoryFailure, (state, { error }) => ({ ...state, saving: false, error })),

    on(SubCategoryActions.deleteSubCategory, (state) => ({ ...state, saving: true, error: null })),
    on(SubCategoryActions.deleteSubCategorySuccess, (state, { id }) => ({ ...state, subCategories: state.subCategories.filter((s) => s._id !== id), saving: false, error: null })),
    on(SubCategoryActions.deleteSubCategoryFailure, (state, { error }) => ({ ...state, saving: false, error }))
);
