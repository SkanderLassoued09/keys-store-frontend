import { createAction, props } from '@ngrx/store';
import { ArticleReturn } from './article-return.model';

export const loadArticleReturns = createAction('[Article Return] Load');
export const loadArticleReturnsSuccess = createAction('[Article Return] Load Success', props<{ returns: ArticleReturn[] }>());
export const loadArticleReturnsFailure = createAction('[Article Return] Load Failure', props<{ error: string }>());

export const createArticleReturn = createAction('[Article Return] Create', props<{ payload: any }>());
export const createArticleReturnSuccess = createAction('[Article Return] Create Success', props<{ articleReturn: ArticleReturn }>());
export const createArticleReturnFailure = createAction('[Article Return] Create Failure', props<{ error: string }>());
