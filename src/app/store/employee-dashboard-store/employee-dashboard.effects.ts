import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AnalyticsService } from '@/layout/service/analytics.service';
import * as DashboardActions from './employee-dashboard.actions';

const extractBackendMessage = (error: any, fallback: string): string => error?.error?.message || error?.message || fallback;

export const loadEmployeeAnalytics$ = createEffect(
    (actions$ = inject(Actions), analyticsService = inject(AnalyticsService)) =>
        actions$.pipe(
            ofType(DashboardActions.loadEmployeeAnalytics),
            switchMap(({ startDate, endDate }) =>
                analyticsService.getEmployees(startDate, endDate).pipe(
                    map((employees) => DashboardActions.loadEmployeeAnalyticsSuccess({ employees })),
                    catchError((error) => of(DashboardActions.loadEmployeeAnalyticsFailure({ error: extractBackendMessage(error, 'Failed to load analytics') })))
                )
            )
        ),
    { functional: true }
);
