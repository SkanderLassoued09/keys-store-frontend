import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { EmployeeLedgerService } from '@/layout/service/employee-ledger.service';
import * as ArticleActions from '../article-store/article.actions';
import * as LedgerActions from './employee-ledger.actions';

const extractBackendMessage = (error: any, fallback: string): string => error?.error?.message || error?.message || fallback;

export const loadLedger$ = createEffect(
    (actions$ = inject(Actions), ledgerService = inject(EmployeeLedgerService)) =>
        actions$.pipe(
            ofType(LedgerActions.loadLedger),
            mergeMap(() =>
                ledgerService.getAll().pipe(
                    map((entries) => LedgerActions.loadLedgerSuccess({ entries })),
                    catchError((error) => of(LedgerActions.loadLedgerFailure({ error: extractBackendMessage(error, 'Failed to load ledger') })))
                )
            )
        ),
    { functional: true }
);

export const createLedger$ = createEffect(
    (actions$ = inject(Actions), ledgerService = inject(EmployeeLedgerService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(LedgerActions.createLedger),
            mergeMap(({ payload }) =>
                ledgerService.create(payload).pipe(
                    map((entry) => {
                        messageService.add({ severity: 'success', summary: 'Succès', detail: 'Mouvement enregistré avec succès', life: 3000 });
                        return LedgerActions.createLedgerSuccess({ entry });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, "Échec de l'enregistrement du mouvement");
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(LedgerActions.createLedgerFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);

export const deleteLedger$ = createEffect(
    (actions$ = inject(Actions), ledgerService = inject(EmployeeLedgerService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(LedgerActions.deleteLedger),
            mergeMap(({ id }) =>
                ledgerService.delete(id).pipe(
                    map(() => {
                        messageService.add({ severity: 'success', summary: 'Succès', detail: 'Mouvement supprimé', life: 3000 });
                        return LedgerActions.deleteLedgerSuccess({ id });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, 'Échec de la suppression');
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(LedgerActions.deleteLedgerFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);

// Stock-affecting movements change shop stock — refresh the Article store so
// the UI reflects the new quantities immediately.
export const refreshArticlesAfterLedger$ = createEffect(
    (actions$ = inject(Actions)) =>
        actions$.pipe(
            ofType(LedgerActions.createLedgerSuccess),
            map(() => ArticleActions.loadArticle())
        ),
    { functional: true }
);
