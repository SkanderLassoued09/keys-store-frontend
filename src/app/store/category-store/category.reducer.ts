import { createReducer, on } from '@ngrx/store';
import { initialState } from './category.state';
import * as CategoryActions from './category.actions';

export const categoryReducer = createReducer(
    initialState,

    on(CategoryActions.loadCategories, (state) => ({ ...state, loading: true, error: null })),
    on(CategoryActions.loadCategoriesSuccess, (state, { categories }) => ({ ...state, categories, loading: false, error: null })),
    on(CategoryActions.loadCategoriesFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(CategoryActions.createCategory, (state) => ({ ...state, saving: true, error: null })),
    on(CategoryActions.createCategorySuccess, (state, { category }) => ({ ...state, categories: [...state.categories, category], saving: false, error: null })),
    on(CategoryActions.createCategoryFailure, (state, { error }) => ({ ...state, saving: false, error })),

    on(CategoryActions.updateCategory, (state) => ({ ...state, saving: true, error: null })),
    on(CategoryActions.updateCategorySuccess, (state, { category }) => ({
        ...state,
        categories: state.categories.map((c) => (c._id === category._id ? category : c)),
        saving: false,
        error: null
    })),
    on(CategoryActions.updateCategoryFailure, (state, { error }) => ({ ...state, saving: false, error })),

    on(CategoryActions.deleteCategory, (state) => ({ ...state, saving: true, error: null })),
    on(CategoryActions.deleteCategorySuccess, (state, { id }) => ({ ...state, categories: state.categories.filter((c) => c._id !== id), saving: false, error: null })),
    on(CategoryActions.deleteCategoryFailure, (state, { error }) => ({ ...state, saving: false, error }))
);
