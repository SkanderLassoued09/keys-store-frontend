import { createReducer, on } from '@ngrx/store';
import * as ProviderActions from './provider.actions';

export interface ProviderState {
    providers: any[];
    loading: boolean;
    loaded: boolean;
    error: string | null;
}

export const initialState: ProviderState = {
    providers: [],
    loading: false,
    loaded: false,
    error: null
};

export const providerReducer = createReducer(
    initialState,

    // Load Providers
    on(ProviderActions.loadProvider, (state) => ({
        ...state,
        loading: true,
        loaded: false,
        error: null
    })),

    on(ProviderActions.loadProviderSuccess, (state, { providers }) => ({
        ...state,
        providers,
        loading: false,
        loaded: true,
        error: null
    })),

    on(ProviderActions.loadProviderFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Create Provider
    on(ProviderActions.createProvider, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ProviderActions.createProviderSuccess, (state, { provider }) => ({
        ...state,
        providers: [...state.providers, provider],
        loading: false,
        error: null
    })),

    on(ProviderActions.createProviderFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Update Provider
    on(ProviderActions.updateProvider, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ProviderActions.updateProviderSuccess, (state, { provider }) => ({
        ...state,
        providers: state.providers.map((prov) => (prov._id === provider._id ? provider : prov)),
        loading: false,
        error: null
    })),

    on(ProviderActions.updateProviderFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Delete Provider
    on(ProviderActions.deleteProvider, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ProviderActions.deleteProviderSuccess, (state, { id }) => ({
        ...state,
        providers: state.providers.filter((prov) => prov._id !== id),
        loading: false,
        error: null
    })),

    on(ProviderActions.deleteProviderFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
);
