import { createReducer, on } from '@ngrx/store';
import * as TransferActions from './stock-transfer.actions';

export interface StockTransferState {
    transfers: any[];
    loading: boolean;
    error: string | null;
}

export const initialState: StockTransferState = {
    transfers: [],
    loading: false,
    error: null
};

export const stockTransferReducer = createReducer(
    initialState,

    on(TransferActions.createTransfer, (state) => ({ ...state, loading: true, error: null })),
    on(TransferActions.createTransferSuccess, (state) => ({ ...state, loading: false, error: null })),
    on(TransferActions.createTransferFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(TransferActions.loadTransfers, (state) => ({ ...state, loading: true, error: null })),
    on(TransferActions.loadTransfersSuccess, (state, { transfers }) => ({ ...state, transfers, loading: false, error: null })),
    on(TransferActions.loadTransfersFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
