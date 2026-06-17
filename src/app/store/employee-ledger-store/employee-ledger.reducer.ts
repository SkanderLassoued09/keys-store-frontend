import { createReducer, on } from '@ngrx/store';
import { initialState } from './employee-ledger.state';
import * as LedgerActions from './employee-ledger.actions';

export const employeeLedgerReducer = createReducer(
    initialState,

    on(LedgerActions.loadLedger, (state) => ({ ...state, loading: true, error: null })),
    on(LedgerActions.loadLedgerSuccess, (state, { entries }) => ({ ...state, entries, loading: false, error: null })),
    on(LedgerActions.loadLedgerFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(LedgerActions.createLedger, (state) => ({ ...state, saving: true, error: null })),
    on(LedgerActions.createLedgerSuccess, (state, { entry }) => ({ ...state, entries: [entry, ...state.entries], saving: false, error: null })),
    on(LedgerActions.createLedgerFailure, (state, { error }) => ({ ...state, saving: false, error })),

    on(LedgerActions.deleteLedger, (state) => ({ ...state, saving: true, error: null })),
    on(LedgerActions.deleteLedgerSuccess, (state, { id }) => ({ ...state, entries: state.entries.filter((e) => e._id !== id), saving: false, error: null })),
    on(LedgerActions.deleteLedgerFailure, (state, { error }) => ({ ...state, saving: false, error }))
);
