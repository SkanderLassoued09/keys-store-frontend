import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AnalyticsService } from '@/layout/service/analytics.service';
import * as BusinessActions from './business-dashboard.actions';

const extractBackendMessage = (error: any, fallback: string): string => error?.error?.message || error?.message || fallback;

export const loadBusinessAnalytics$ = createEffect(
    (actions$ = inject(Actions), analyticsService = inject(AnalyticsService)) =>
        actions$.pipe(
            ofType(BusinessActions.loadBusinessAnalytics),
            switchMap(({ startDate, endDate }) =>
                analyticsService.getBusiness(startDate, endDate).pipe(
                    map((data) => BusinessActions.loadBusinessAnalyticsSuccess({ data })),
                    catchError((error) => of(BusinessActions.loadBusinessAnalyticsFailure({ error: extractBackendMessage(error, 'Échec du chargement du tableau de bord') })))
                )
            )
        ),
    { functional: true }
);
