import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import * as TransferActions from './stock-transfer.actions';
import * as ArticleActions from '../article-store/article.actions';
import { StockTransferService } from '@/layout/service/stock-transfer.service';

const extractBackendMessage = (error: any, fallback: string): string => error?.error?.message || error?.message || fallback;

export const createTransfer$ = createEffect(
    (actions$ = inject(Actions), service = inject(StockTransferService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(TransferActions.createTransfer),
            mergeMap(({ payload }) =>
                service.create(payload).pipe(
                    map((updatedArticle) => {
                        messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Transfert effectué avec succès',
                            life: 4000
                        });
                        return TransferActions.createTransferSuccess({ updatedArticle });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, 'Échec du transfert');
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(TransferActions.createTransferFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);

// On successful transfer, refresh the Article store so both columns reflect
// the new stock values immediately.
export const refreshArticlesAfterTransfer$ = createEffect(
    (actions$ = inject(Actions)) =>
        actions$.pipe(
            ofType(TransferActions.createTransferSuccess),
            map(() => ArticleActions.loadArticle())
        ),
    { functional: true }
);

export const loadTransfers$ = createEffect(
    (actions$ = inject(Actions), service = inject(StockTransferService)) =>
        actions$.pipe(
            ofType(TransferActions.loadTransfers),
            mergeMap(() =>
                service.getAll().pipe(
                    map((transfers) => TransferActions.loadTransfersSuccess({ transfers })),
                    catchError((error) => of(TransferActions.loadTransfersFailure({ error: error?.message || 'Failed' })))
                )
            )
        ),
    { functional: true }
);
