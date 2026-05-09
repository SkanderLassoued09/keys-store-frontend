import { createAction, props } from '@ngrx/store';
import { CreateStockTransferPayload } from '@/layout/service/stock-transfer.service';

// Create transfer
export const createTransfer = createAction('[StockTransfer] Create', props<{ payload: CreateStockTransferPayload }>());
export const createTransferSuccess = createAction('[StockTransfer] Create Success', props<{ updatedArticle: any }>());
export const createTransferFailure = createAction('[StockTransfer] Create Failure', props<{ error: string }>());

// Load history
export const loadTransfers = createAction('[StockTransfer] Load');
export const loadTransfersSuccess = createAction('[StockTransfer] Load Success', props<{ transfers: any[] }>());
export const loadTransfersFailure = createAction('[StockTransfer] Load Failure', props<{ error: string }>());
