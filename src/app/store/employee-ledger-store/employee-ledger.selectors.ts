import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmployeeLedgerState } from './employee-ledger.state';

export const selectLedgerState = createFeatureSelector<EmployeeLedgerState>('employeeLedger');
export const selectAllLedger = createSelector(selectLedgerState, (state) => state.entries);
export const selectLedgerLoading = createSelector(selectLedgerState, (state) => state.loading);
export const selectLedgerSaving = createSelector(selectLedgerState, (state) => state.saving);
export const selectLedgerError = createSelector(selectLedgerState, (state) => state.error);
