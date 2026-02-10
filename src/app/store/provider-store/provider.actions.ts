import { createAction, props } from '@ngrx/store';

// export interface Provider {
//     _id?: string;
//     name: string;
//     company?: string;
//     email?: string;
//     phone?: string;
//     address?: string;
//     articles?: string[];
//     machines?: string[];
//     bills?: string[];
// }

// Load Providers
export const loadProvider = createAction('[Provider] Load Provider');

export const loadProviderSuccess = createAction('[Provider] Load Provider Success', props<{ providers: any[] }>());

export const loadProviderFailure = createAction('[Provider] Load Provider Failure', props<{ error: string }>());

// Create Provider
export const createProvider = createAction('[Provider] Create Provider', props<{ provider: Partial<any> }>());

export const createProviderSuccess = createAction('[Provider] Create Provider Success', props<{ provider: any }>());

export const createProviderFailure = createAction('[Provider] Create Provider Failure', props<{ error: string }>());

// Update Provider
export const updateProvider = createAction('[Provider] Update Provider', props<{ provider: { id: string } & Partial<any> }>());

export const updateProviderSuccess = createAction('[Provider] Update Provider Success', props<{ provider: any }>());

export const updateProviderFailure = createAction('[Provider] Update Provider Failure', props<{ error: string }>());

// Delete Provider
export const deleteProvider = createAction('[Provider] Delete Provider', props<{ id: string }>());

export const deleteProviderSuccess = createAction('[Provider] Delete Provider Success', props<{ id: string }>());

export const deleteProviderFailure = createAction('[Provider] Delete Provider Failure', props<{ error: string }>());
