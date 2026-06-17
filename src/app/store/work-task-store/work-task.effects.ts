import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { WorkTaskService } from '@/layout/service/work-task.service';
import * as TaskActions from './work-task.actions';

const extractBackendMessage = (error: any, fallback: string): string => error?.error?.message || error?.message || fallback;

export const loadTasks$ = createEffect(
    (actions$ = inject(Actions), taskService = inject(WorkTaskService)) =>
        actions$.pipe(
            ofType(TaskActions.loadTasks),
            mergeMap(() =>
                taskService.getAll().pipe(
                    map((tasks) => TaskActions.loadTasksSuccess({ tasks })),
                    catchError((error) => of(TaskActions.loadTasksFailure({ error: extractBackendMessage(error, 'Failed to load tasks') })))
                )
            )
        ),
    { functional: true }
);

export const createTask$ = createEffect(
    (actions$ = inject(Actions), taskService = inject(WorkTaskService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(TaskActions.createTask),
            mergeMap(({ payload }) =>
                taskService.create(payload).pipe(
                    map((task) => {
                        messageService.add({ severity: 'success', summary: 'Succès', detail: 'Tâche créée', life: 3000 });
                        return TaskActions.createTaskSuccess({ task });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, 'Échec de la création de la tâche');
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(TaskActions.createTaskFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);

export const updateTask$ = createEffect(
    (actions$ = inject(Actions), taskService = inject(WorkTaskService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(TaskActions.updateTask),
            mergeMap(({ id, payload }) =>
                taskService.update(id, payload).pipe(
                    map((task) => TaskActions.updateTaskSuccess({ task })),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, 'Échec de la mise à jour de la tâche');
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(TaskActions.updateTaskFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);

export const deleteTask$ = createEffect(
    (actions$ = inject(Actions), taskService = inject(WorkTaskService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(TaskActions.deleteTask),
            mergeMap(({ id }) =>
                taskService.delete(id).pipe(
                    map(() => {
                        messageService.add({ severity: 'success', summary: 'Succès', detail: 'Tâche supprimée', life: 3000 });
                        return TaskActions.deleteTaskSuccess({ id });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, 'Échec de la suppression de la tâche');
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(TaskActions.deleteTaskFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);
