import { createReducer, on } from '@ngrx/store';
import { ArticleReturn } from './article-return.model';
import * as ArticleReturnActions from './article-return.actions';

export interface ArticleReturnState {
    returns: ArticleReturn[];
    loading: boolean;
    error: string | null;
}

export const initialState: ArticleReturnState = {
    returns: [],
    loading: false,
    error: null
};

export const articleReturnReducer = createReducer(
    initialState,
    on(ArticleReturnActions.loadArticleReturns, (state) => ({ ...state, loading: true, error: null })),
    on(ArticleReturnActions.loadArticleReturnsSuccess, (state, { returns }) => ({ ...state, returns, loading: false, error: null })),
    on(ArticleReturnActions.loadArticleReturnsFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(ArticleReturnActions.createArticleReturn, (state) => ({ ...state, loading: true, error: null })),
    on(ArticleReturnActions.createArticleReturnSuccess, (state, { articleReturn }) => ({ ...state, returns: [articleReturn, ...state.returns], loading: false, error: null })),
    on(ArticleReturnActions.createArticleReturnFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
