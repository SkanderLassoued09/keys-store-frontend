import { createReducer, on } from '@ngrx/store';
import * as SettingsActions from './settings.actions';
import { initialState } from './settings.state';

export const settingsReducer = createReducer(
    initialState,

    on(SettingsActions.loadSettings, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(SettingsActions.loadSettingsSuccess, (state, { settings }) => ({
        ...state,
        settings,
        loading: false,
        error: null
    })),

    on(SettingsActions.loadSettingsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(SettingsActions.updateSettings, (state) => ({
        ...state,
        saving: true,
        error: null
    })),

    on(SettingsActions.updateSettingsSuccess, (state, { settings }) => ({
        ...state,
        settings,
        saving: false,
        error: null
    })),

    on(SettingsActions.updateSettingsFailure, (state, { error }) => ({
        ...state,
        saving: false,
        error
    }))
);
