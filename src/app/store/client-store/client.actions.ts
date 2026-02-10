import { createAction, props } from '@ngrx/store';

// Load client
export const loadClient = createAction('[Client] Load Client');
export const loadClientSuccess = createAction('[client] Load Client Success', props<{ client: any }>());
export const loadClientFailure = createAction('[Client] Load Client Failure', props<{ error: string }>());

// Create client
export const createClient = createAction('[Client] Create Client', props<{ client: any }>());
export const createClientSuccess = createAction('[Client] Create Client Success', props<{ client: any }>());
export const createClientFailure = createAction('[Client] Create Client Failure', props<{ error: string }>());

// Update client
export const updateClient = createAction('[Client] Update Client', props<{ client: any }>());
export const updateClientSuccess = createAction('[Client] Update Client Success', props<{ client: any }>());
export const updateClientFailure = createAction('[Client] Update Client Failure', props<{ error: string }>());

// Delete client
export const deleteClient = createAction('[Client] Delete Client', props<{ id: string }>());
export const deleteClientSuccess = createAction('[Client] Delete Client Success', props<{ id: string }>());
export const deleteClientFailure = createAction('[Client] Delete Client Failure', props<{ error: string }>());

// Select client
export const selectClient = createAction('[Client] Select Client', props<{ client: any }>());
