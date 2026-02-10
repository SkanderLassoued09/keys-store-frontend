import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as ArticleAction from './article.actions';
import { ArticleService } from '@/layout/service/article.service';

export const loadArticlesEffect = createEffect(
    (actions$ = inject(Actions), articleService = inject(ArticleService)) => {
        return actions$.pipe(
            ofType(ArticleAction.loadArticle),
            switchMap(() =>
                articleService.getAllArticles().pipe(
                    map((articles) => ArticleAction.loadArticleSuccess({ article: articles })),
                    catchError((error) => of(ArticleAction.loadArticleFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);

export const createArticleEffect = createEffect(
    (actions$ = inject(Actions), articleService = inject(ArticleService)) => {
        return actions$.pipe(
            ofType(ArticleAction.createArticle),
            switchMap(({ article }) =>
                articleService.createArticle(article).pipe(
                    map((article) => ArticleAction.createArticleSuccess({ article })),
                    catchError((error) => of(ArticleAction.createArticleFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);

export const updateArticleEffect = createEffect(
    (actions$ = inject(Actions), articleService = inject(ArticleService)) => {
        return actions$.pipe(
            ofType(ArticleAction.updateArticle),
            switchMap(({ article }) =>
                articleService.updateArticle(article.id, article).pipe(
                    map((article) => ArticleAction.updateArticleSuccess({ article })),
                    catchError((error) => of(ArticleAction.updateArticleFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);

export const deleteArticleEffect = createEffect(
    (actions$ = inject(Actions), articleService = inject(ArticleService)) => {
        return actions$.pipe(
            ofType(ArticleAction.deleteArticle),
            switchMap(({ id }) =>
                articleService.deleteArticle(id).pipe(
                    map(() => ArticleAction.deleteArticleSuccess({ id })),
                    catchError((error) => of(ArticleAction.deleteArticleFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);
