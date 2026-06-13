import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ArticleReturnState } from './article-return.reducer';

export const selectArticleReturnState = createFeatureSelector<ArticleReturnState>('articleReturn');
export const selectAllArticleReturns = createSelector(selectArticleReturnState, (state) => state.returns);
export const selectArticleReturnLoading = createSelector(selectArticleReturnState, (state) => state.loading);
export const selectArticleReturnError = createSelector(selectArticleReturnState, (state) => state.error);
