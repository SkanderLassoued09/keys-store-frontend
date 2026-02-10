import { ClientService } from '@/layout/service/client.service';
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ClientAction from '../client-store/client.actions';
import { catchError, map, of, switchMap } from 'rxjs';

export const loadClientEffect = createEffect(
    (action$ = inject(Actions), clientService = inject(ClientService)) => {
        return action$.pipe(
            ofType(ClientAction.loadClient),
            switchMap(() =>
                clientService.getAllClients().pipe(
                    map((clients) => ClientAction.loadClientSuccess({ client: clients })),
                    catchError((error) => of(ClientAction.loadClientFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);

export const createClientEffect = createEffect(
    (action$ = inject(Actions), clientService = inject(ClientService)) => {
        return action$.pipe(
            ofType(ClientAction.createClient),
            switchMap(({ client }) =>
                clientService.createClient(client).pipe(
                    map((clients) => ClientAction.createClientSuccess({ client: clients })),
                    catchError((error) => of(ClientAction.createClientFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);

export const updateClientEffect = createEffect(
    (action$ = inject(Actions), clientService = inject(ClientService)) => {
        return action$.pipe(
            ofType(ClientAction.updateClient),
            switchMap(({ client }) =>
                clientService.updateClient(client.id!, client).pipe(
                    map((client) => ClientAction.updateClientSuccess({ client })),
                    catchError((error) => of(ClientAction.updateClientFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);

export const deleteClientEffect = createEffect(
    (action$ = inject(Actions), clientService = inject(ClientService)) => {
        return action$.pipe(
            ofType(ClientAction.deleteClient),
            switchMap(({ id }) =>
                clientService.deleteClient(id).pipe(
                    map(() => ClientAction.deleteClientSuccess({ id })),
                    catchError((error) => of(ClientAction.deleteClientFailure({ error: error.message })))
                )
            )
        );
    },
    { functional: true }
);
