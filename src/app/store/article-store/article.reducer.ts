import { createReducer, on } from '@ngrx/store';
import { initialState } from './article.state';
import * as ArticleActions from './article.actions';

export const articleReducer = createReducer(
    initialState,

    // Load Articles
    on(ArticleActions.loadArticle, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(ArticleActions.loadArticleSuccess, (state, { article }) => ({
        ...state,
        articles: article, // ✅ Set the articles array (article contains array from API)
        loading: false,
        error: null
    })),
    on(ArticleActions.loadArticleFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Create Article
    on(ArticleActions.createArticle, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(ArticleActions.createArticleSuccess, (state, { article }) => ({
        ...state,
        articles: [...state.articles, article],
        loading: false,
        error: null
    })),
    on(ArticleActions.createArticleFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Update Article
    on(ArticleActions.updateArticle, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(ArticleActions.updateArticleSuccess, (state, { article }) => {
        const updatedArticles = state.articles.map((a) => {
            return a._id === article._id ? article : a;
        });
        return {
            ...state,
            articles: updatedArticles,
            loading: false,
            error: null
        };
    }),
    on(ArticleActions.updateArticleFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Delete Article
    on(ArticleActions.deleteArticle, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(ArticleActions.deleteArticleSuccess, (state, { id }) => ({
        ...state,
        articles: state.articles.filter((a) => a._id !== id),
        loading: false,
        error: null
    })),
    on(ArticleActions.deleteArticleFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Select Article (for viewing/editing a single article)
    on(ArticleActions.selectArticle, (state, { article }) => ({
        ...state,
        selectedArticle: article
    }))
);
