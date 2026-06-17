import { EmployeeLedgerEntry } from '@/layout/service/employee-ledger.service';

export interface EmployeeLedgerState {
    entries: EmployeeLedgerEntry[];
    loading: boolean;
    saving: boolean;
    error: string | null;
}

export const initialState: EmployeeLedgerState = {
    entries: [],
    loading: false,
    saving: false,
    error: null
};
