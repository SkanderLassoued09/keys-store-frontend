import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SettingsService } from '@/layout/service/settings.service';
import * as SettingsActions from './settings.actions';

const extractBackendMessage = (error: any, fallback: string): string => error?.error?.message || error?.message || fallback;

export const loadSettings$ = createEffect(
    (actions$ = inject(Actions), settingsService = inject(SettingsService)) =>
        actions$.pipe(
            ofType(SettingsActions.loadSettings),
            mergeMap(() =>
                settingsService.getSettings().pipe(
                    map((settings) => SettingsActions.loadSettingsSuccess({ settings })),
                    catchError((error) => of(SettingsActions.loadSettingsFailure({ error: extractBackendMessage(error, 'Failed to load settings') })))
                )
            )
        ),
    { functional: true }
);

export const updateSettings$ = createEffect(
    (actions$ = inject(Actions), settingsService = inject(SettingsService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(SettingsActions.updateSettings),
            mergeMap(({ settings }) =>
                settingsService.updateSettings(settings).pipe(
                    map((updatedSettings) => {
                        messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Paramètres enregistrés avec succès',
                            life: 3000
                        });
                        return SettingsActions.updateSettingsSuccess({ settings: updatedSettings });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, "Échec de l'enregistrement des paramètres");
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(SettingsActions.updateSettingsFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);
