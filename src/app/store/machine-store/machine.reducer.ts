import { createReducer, on } from '@ngrx/store';
import { initialState } from './machine.state';
import * as MachineAction from './machine.actions';

export const machineReducer = createReducer(
    initialState,
    // Load machine
    on(MachineAction.loadMachine, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(MachineAction.loadMachineSuccess, (state, { machine }) => ({
        ...state,
        machines: machine,
        loading: false,
        error: null
    })),
    on(MachineAction.loadMachineFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Create machine
    on(MachineAction.createMachine, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(MachineAction.createMachineSuccess, (state, { machine }) => ({
        ...state,
        machines: [...state.machines, machine],
        loading: false,
        error: null
    })),
    on(MachineAction.createMachineFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Update machine
    on(MachineAction.updateMachine, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(MachineAction.updateMachineSuccess, (state, { machine }) => {
        const updatedMachines = state.machines.map((m) => {
            return m._id === machine._id ? machine : m;
        });
        return {
            ...state,
            machines: updatedMachines,
            loading: false,
            error: null
        };
    }),
    on(MachineAction.updateMachineFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Delete machine
    on(MachineAction.deleteMachine, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(MachineAction.deleteMachineSuccess, (state, { id }) => {
        const deletedMachines = state.machines.filter((m) => m._id !== id);
        return {
            ...state,
            loading: false,
            machines: deletedMachines,
            error: null
        };
    }),
    on(MachineAction.deleteMachineFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Select machine
    on(MachineAction.selectMachine, (state, { machine }) => ({
        ...state,
        selectedMachine: machine
    }))
);
