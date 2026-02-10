import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MachineState } from './machine.state';

export const selectMachineState = createFeatureSelector<MachineState>('machine');

export const selectAllMachines = createSelector(selectMachineState, (state: MachineState) => state.machines);

export const selectMachineLoading = createSelector(selectMachineState, (state: MachineState) => state.loading);

export const selectMachineError = createSelector(selectMachineState, (state: MachineState) => state.error);

export const selectSelectedMachine = createSelector(selectMachineState, (state: MachineState) => state.selectedMachine);

export const selectMachineFromDropdown = createSelector(selectAllMachines, (machines) =>
    machines.map((m) => ({
        id: m._id,
        name: m.name
    }))
);

// Get machine by ID
export const selectMachineById = (id: string) => createSelector(selectAllMachines, (machines) => machines.find((m) => m._id === id));

// Get machines by status
export const selectMachinesByStatus = (status: string) => createSelector(selectAllMachines, (machines) => machines.filter((m) => m.status === status));

// Get active machines
export const selectActiveMachines = createSelector(selectAllMachines, (machines) => machines.filter((m) => m.status === 'active'));

// Get machines in maintenance
export const selectMaintenanceMachines = createSelector(selectAllMachines, (machines) => machines.filter((m) => m.status === 'maintenance'));
