import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProviderState } from './provider.reducer';

export const selectProviderState = createFeatureSelector<ProviderState>('provider');

export const selectAllProviders = createSelector(selectProviderState, (state: ProviderState) => state.providers);

export const selectProviderLoading = createSelector(selectProviderState, (state: ProviderState) => state.loading);

export const selectProviderError = createSelector(selectProviderState, (state: ProviderState) => state.error);

export const selectProviderById = (id: string) => createSelector(selectAllProviders, (providers) => providers.find((prov) => prov._id === id));
export const selectProvidersLoaded = createSelector(selectProviderState, (state) => state.loaded);
export const selectProvidersForDropdown = createSelector(selectAllProviders, (providers) =>
    providers.map((p) => ({
        id: p._id,
        name: p.name
    }))
);
