import { createAction, props } from '@ngrx/store';
import { EmployeeLedgerEntry } from '@/layout/service/employee-ledger.service';

export const loadLedger = createAction('[EmployeeLedger] Load');
export const loadLedgerSuccess = createAction('[EmployeeLedger] Load Success', props<{ entries: EmployeeLedgerEntry[] }>());
export const loadLedgerFailure = createAction('[EmployeeLedger] Load Failure', props<{ error: string }>());

export const createLedger = createAction('[EmployeeLedger] Create', props<{ payload: Partial<EmployeeLedgerEntry> }>());
export const createLedgerSuccess = createAction('[EmployeeLedger] Create Success', props<{ entry: EmployeeLedgerEntry }>());
export const createLedgerFailure = createAction('[EmployeeLedger] Create Failure', props<{ error: string }>());

export const deleteLedger = createAction('[EmployeeLedger] Delete', props<{ id: string }>());
export const deleteLedgerSuccess = createAction('[EmployeeLedger] Delete Success', props<{ id: string }>());
export const deleteLedgerFailure = createAction('[EmployeeLedger] Delete Failure', props<{ error: string }>());
