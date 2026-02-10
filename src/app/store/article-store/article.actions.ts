import { createAction, props } from '@ngrx/store';

// Load Article
export const loadArticle = createAction('[Article] Load Article');
export const loadArticleSuccess = createAction('[Article] Load Article Success', props<{ article: any }>());
export const loadArticleFailure = createAction('[Article] Load Article Failure', props<{ error: string }>());

// Create Article
export const createArticle = createAction('[Article] Create Article', props<{ article: any }>());
export const createArticleSuccess = createAction('[Article] Create Article Success', props<{ article: any }>());
export const createArticleFailure = createAction('[Article] Create Article Failure', props<{ error: string }>());

// Update Article
export const updateArticle = createAction('[Article] Update Article', props<{ article: any }>());
export const updateArticleSuccess = createAction('[Article] Update Article Success', props<{ article: any }>());
export const updateArticleFailure = createAction('[Article] Update Article Failure', props<{ error: string }>());

// Delete Article
export const deleteArticle = createAction('[Article] Delete Article', props<{ id: string }>());
export const deleteArticleSuccess = createAction('[Article] Delete Article Success', props<{ id: string }>());
export const deleteArticleFailure = createAction('[Article] Delete Article Failure', props<{ error: string }>());

// Select Article
export const selectArticle = createAction('[Article] Select Article', props<{ article: any }>());
