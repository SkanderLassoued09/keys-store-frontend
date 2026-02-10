import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClientState } from './client.state';

export const selectClientState = createFeatureSelector<ClientState>('client');

export const selectAllClients = createSelector(selectClientState, (state: ClientState) => state.clients);

export const selectClientLoading = createSelector(selectClientState, (state: ClientState) => state.loading);

export const selectClientError = createSelector(selectClientState, (state: ClientState) => state.error);

export const selectClientFromDropdown = createSelector(selectAllClients, (clients) =>
    clients.map((c) => ({
        id: c._id,
        name: `${c.firstName} ${c.lastName}`
    }))
);
