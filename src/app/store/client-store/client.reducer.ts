import { createReducer, on } from '@ngrx/store';
import { initialState } from './client.state';
import * as ClientAction from '../client-store/client.actions';

export const clientReducer = createReducer(
    initialState,
    // Load client
    on(ClientAction.loadClient, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(ClientAction.loadClientSuccess, (state, { client }) => ({
        ...state,
        clients: client,
        loading: false,
        error: null
    })),
    on(ClientAction.loadClientFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),
    // Create client
    on(ClientAction.createClient, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ClientAction.createClientSuccess, (state, { client }) => ({
        ...state,
        clients: [...state.clients, client],
        loading: false,
        error: null
    })),
    on(ClientAction.createClientFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Update client
    on(ClientAction.updateClient, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ClientAction.updateClientSuccess, (state, { client }) => {
        const updatedClient = state.clients.map((c) => {
            return c._id === client._id ? client : c;
        });
        return {
            ...state,
            clients: updatedClient,
            loading: false,
            error: null
        };
    }),

    on(ClientAction.updateClientFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Delete Client

    on(ClientAction.deleteClient, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ClientAction.deleteClientSuccess, (state, { id }) => {
        const deletedClient = state.clients.filter((c) => c._id !== id);
        return {
            ...state,
            loading: false,
            clients: deletedClient,
            error: null
        };
    }),

    on(ClientAction.deleteClientFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
);
