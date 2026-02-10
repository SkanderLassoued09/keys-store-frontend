import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as EmployeeActions from '../employee-store/emloyee.actions';

import { MessageService } from 'primeng/api';
import { EmployeeService } from '@/layout/service/employee.service';

export const loadEmployees$ = createEffect(
    (actions$ = inject(Actions), employeeService = inject(EmployeeService)) => {
        return actions$.pipe(
            ofType(EmployeeActions.loadEmployee),
            mergeMap(() =>
                employeeService.getAllEmployees().pipe(
                    map((employees) => EmployeeActions.loadEmployeeSuccess({ employees })),
                    catchError((error) =>
                        of(
                            EmployeeActions.loadEmployeeFailure({
                                error: error.message || 'Failed to load employees'
                            })
                        )
                    )
                )
            )
        );
    },
    { functional: true }
);

export const createEmployee$ = createEffect(
    (actions$ = inject(Actions), employeeService = inject(EmployeeService), messageService = inject(MessageService)) => {
        return actions$.pipe(
            ofType(EmployeeActions.createEmployee),
            mergeMap(({ employee }) =>
                employeeService.createEmployee(employee).pipe(
                    map((createdEmployee) => {
                        messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Employé créé avec succès',
                            life: 3000
                        });
                        return EmployeeActions.createEmployeeSuccess({ employee: createdEmployee });
                    }),
                    catchError((error) => {
                        messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: "Échec de la création de l'employé",
                            life: 3000
                        });
                        return of(
                            EmployeeActions.createEmployeeFailure({
                                error: error.message || 'Failed to create employee'
                            })
                        );
                    })
                )
            )
        );
    },
    { functional: true }
);

export const updateEmployee$ = createEffect(
    (actions$ = inject(Actions), employeeService = inject(EmployeeService), messageService = inject(MessageService)) => {
        return actions$.pipe(
            ofType(EmployeeActions.updateEmployee),
            mergeMap(({ employee }) =>
                employeeService.updateEmployee(employee.id, employee).pipe(
                    map((updatedEmployee) => {
                        messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Employé modifié avec succès',
                            life: 3000
                        });
                        return EmployeeActions.updateEmployeeSuccess({ employee: updatedEmployee });
                    }),
                    catchError((error) => {
                        messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: "Échec de la modification de l'employé",
                            life: 3000
                        });
                        return of(
                            EmployeeActions.updateEmployeeFailure({
                                error: error.message || 'Failed to update employee'
                            })
                        );
                    })
                )
            )
        );
    },
    { functional: true }
);

export const deleteEmployee$ = createEffect(
    (actions$ = inject(Actions), employeeService = inject(EmployeeService), messageService = inject(MessageService)) => {
        return actions$.pipe(
            ofType(EmployeeActions.deleteEmployee),
            mergeMap(({ id }) =>
                employeeService.deleteEmployee(id).pipe(
                    map(() => {
                        messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Employé supprimé avec succès',
                            life: 3000
                        });
                        return EmployeeActions.deleteEmployeeSuccess({ id });
                    }),
                    catchError((error) =>
                        of(
                            EmployeeActions.deleteEmployeeFailure({
                                error: error.message || 'Failed to delete employee'
                            })
                        )
                    )
                )
            )
        );
    },
    { functional: true }
);
