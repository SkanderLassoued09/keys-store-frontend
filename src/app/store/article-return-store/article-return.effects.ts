import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ArticleReturnService } from '@/layout/service/article-return.service';
import * as ArticleActions from '../article-store/article.actions';
import * as ArticleReturnActions from './article-return.actions';

const extractBackendMessage = (error: any, fallback: string): string => error?.error?.message || error?.message || fallback;

export const loadArticleReturns$ = createEffect(
    (actions$ = inject(Actions), articleReturnService = inject(ArticleReturnService)) =>
        actions$.pipe(
            ofType(ArticleReturnActions.loadArticleReturns),
            switchMap(() =>
                articleReturnService.getAll().pipe(
                    map((returns) => ArticleReturnActions.loadArticleReturnsSuccess({ returns })),
                    catchError((error) => of(ArticleReturnActions.loadArticleReturnsFailure({ error: extractBackendMessage(error, 'Failed to load article returns') })))
                )
            )
        ),
    { functional: true }
);

export const createArticleReturn$ = createEffect(
    (actions$ = inject(Actions), articleReturnService = inject(ArticleReturnService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(ArticleReturnActions.createArticleReturn),
            switchMap(({ payload }) =>
                articleReturnService.create(payload).pipe(
                    map((articleReturn) => {
                        messageService.add({ severity: 'success', summary: 'Succès', detail: 'Retour enregistré avec succès', life: 3000 });
                        return ArticleReturnActions.createArticleReturnSuccess({ articleReturn });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, "Échec de l'enregistrement du retour");
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(ArticleReturnActions.createArticleReturnFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);

export const refreshArticlesAfterReturn$ = createEffect(
    (actions$ = inject(Actions)) =>
        actions$.pipe(
            ofType(ArticleReturnActions.createArticleReturnSuccess),
            map(() => ArticleActions.loadArticle())
        ),
    { functional: true }
);
