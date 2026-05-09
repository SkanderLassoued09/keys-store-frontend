import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StockTransferState } from './stock-transfer.reducer';

export const selectStockTransferState = createFeatureSelector<StockTransferState>('stockTransfer');
export const selectAllTransfers = createSelector(selectStockTransferState, (s) => s.transfers);
export const selectTransferLoading = createSelector(selectStockTransferState, (s) => s.loading);
export const selectTransferError = createSelector(selectStockTransferState, (s) => s.error);
