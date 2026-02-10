import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ArticleState } from './article.state';

export const selectArticleState = createFeatureSelector<ArticleState>('article');
export const selectAllArticles = createSelector(selectArticleState, (state) => state.articles);
export const selectSelectedArticle = createSelector(selectArticleState, (state) => state.selectedArticle);
export const selectArticleLoading = createSelector(selectArticleState, (state) => state.loading);
export const selectArticleError = createSelector(selectArticleState, (state) => state.error);
export const selectUniqueCategories = createSelector(selectAllArticles, (articles) => [...new Set(articles.map((a) => a.category))]);
export const selectUniqueTypes = createSelector(selectAllArticles, (articles) => [...new Set(articles.map((a) => a.type))]);
