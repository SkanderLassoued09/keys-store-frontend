import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import * as MachineAction from './machine.actions';
import { MachineService } from '@/layout/service/machine.service';

export const loadMachineEffect = createEffect(
    (action$ = inject(Actions), machineService = inject(MachineService)) => {
        return action$.pipe(
            ofType(MachineAction.loadMachine),
            switchMap(() =>
                machineService.getAllMachines().pipe(
                    map((machines) => MachineAction.loadMachineSuccess({ machine: machines })),
                    catchError((error) => of(MachineAction.loadMachineFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);

export const createMachineEffect = createEffect(
    (action$ = inject(Actions), machineService = inject(MachineService)) => {
        return action$.pipe(
            ofType(MachineAction.createMachine),
            switchMap(({ machine }) =>
                machineService.createMachine(machine).pipe(
                    map((machines) => MachineAction.createMachineSuccess({ machine: machines })),
                    catchError((error) => of(MachineAction.createMachineFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);

export const updateMachineEffect = createEffect(
    (action$ = inject(Actions), machineService = inject(MachineService)) => {
        return action$.pipe(
            ofType(MachineAction.updateMachine),
            switchMap(({ machine }) =>
                machineService.updateMachine(machine.id!, machine).pipe(
                    map((machine) => MachineAction.updateMachineSuccess({ machine })),
                    catchError((error) => of(MachineAction.updateMachineFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);

export const deleteMachineEffect = createEffect(
    (action$ = inject(Actions), machineService = inject(MachineService)) => {
        return action$.pipe(
            ofType(MachineAction.deleteMachine),
            switchMap(({ id }) =>
                machineService.deleteMachine(id).pipe(
                    map(() => MachineAction.deleteMachineSuccess({ id })),
                    catchError((error) => of(MachineAction.deleteMachineFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);
