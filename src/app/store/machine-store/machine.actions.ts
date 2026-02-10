import { createAction, props } from '@ngrx/store';

// Load machine
export const loadMachine = createAction('[Machine] Load Machine');
export const loadMachineSuccess = createAction('[Machine] Load Machine Success', props<{ machine: any }>());
export const loadMachineFailure = createAction('[Machine] Load Machine Failure', props<{ error: string }>());

// Create machine
export const createMachine = createAction('[Machine] Create Machine', props<{ machine: any }>());
export const createMachineSuccess = createAction('[Machine] Create Machine Success', props<{ machine: any }>());
export const createMachineFailure = createAction('[Machine] Create Machine Failure', props<{ error: string }>());

// Update machine
export const updateMachine = createAction('[Machine] Update Machine', props<{ machine: any }>());
export const updateMachineSuccess = createAction('[Machine] Update Machine Success', props<{ machine: any }>());
export const updateMachineFailure = createAction('[Machine] Update Machine Failure', props<{ error: string }>());

// Delete machine
export const deleteMachine = createAction('[Machine] Delete Machine', props<{ id: string }>());
export const deleteMachineSuccess = createAction('[Machine] Delete Machine Success', props<{ id: string }>());
export const deleteMachineFailure = createAction('[Machine] Delete Machine Failure', props<{ error: string }>());

// Select machine
export const selectMachine = createAction('[Machine] Select Machine', props<{ machine: any }>());
