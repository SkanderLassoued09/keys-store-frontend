import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import * as ProviderActions from './provider.actions';
import { inject } from '@angular/core';
import { ProviderService } from '@/layout/service/provider.service';
import { Store } from '@ngrx/store';
import { selectProvidersLoaded } from './provider.selectors';

export const loadProviders$ = createEffect(
    (actions$ = inject(Actions), providerService = inject(ProviderService), store = inject(Store)) => {
        return actions$.pipe(
            ofType(ProviderActions.loadProvider),

            withLatestFrom(store.select(selectProvidersLoaded)),
            filter(([, loaded]) => !loaded),

            mergeMap(() =>
                providerService.getAllProviders().pipe(
                    map((providers) => ProviderActions.loadProviderSuccess({ providers })),
                    catchError((error) =>
                        of(
                            ProviderActions.loadProviderFailure({
                                error: error.message || 'Failed to load providers'
                            })
                        )
                    )
                )
            )
        );
    },
    { functional: true }
);

export const createProvider$ = createEffect(
    (actions$ = inject(Actions), providerService = inject(ProviderService)) => {
        return actions$.pipe(
            ofType(ProviderActions.createProvider),
            mergeMap(({ provider }) =>
                providerService.createProvider(provider).pipe(
                    map((createdProvider) => ProviderActions.createProviderSuccess({ provider: createdProvider })),
                    catchError((error) =>
                        of(
                            ProviderActions.createProviderFailure({
                                error: error.message || 'Failed to create provider'
                            })
                        )
                    )
                )
            )
        );
    },
    { functional: true }
);

export const updateProvider$ = createEffect(
    (actions$ = inject(Actions), providerService = inject(ProviderService)) => {
        return actions$.pipe(
            ofType(ProviderActions.updateProvider),
            mergeMap(({ provider }) =>
                providerService.updateProvider(provider.id, provider).pipe(
                    map((updatedProvider) => ProviderActions.updateProviderSuccess({ provider: updatedProvider })),
                    catchError((error) =>
                        of(
                            ProviderActions.updateProviderFailure({
                                error: error.message || 'Failed to update provider'
                            })
                        )
                    )
                )
            )
        );
    },
    { functional: true }
);

export const deleteProvider$ = createEffect(
    (actions$ = inject(Actions), providerService = inject(ProviderService)) => {
        return actions$.pipe(
            ofType(ProviderActions.deleteProvider),
            mergeMap(({ id }) =>
                providerService.deleteProvider(id).pipe(
                    map(() => ProviderActions.deleteProviderSuccess({ id })),
                    catchError((error) =>
                        of(
                            ProviderActions.deleteProviderFailure({
                                error: error.message || 'Failed to delete provider'
                            })
                        )
                    )
                )
            )
        );
    },
    { functional: true }
);
