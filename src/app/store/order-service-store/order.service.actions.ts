import { createAction, props } from '@ngrx/store';

// Load Orders
export const loadOrder = createAction('[Order] Load Order');
export const loadOrderSuccess = createAction('[Order] Load Order Success', props<{ orders: any[] }>());
export const loadOrderFailure = createAction('[Order] Load Order Failure', props<{ error: string }>());

// Create Single Order
export const createOrder = createAction('[Order] Create Order', props<{ order: Partial<any> }>());
export const createOrderSuccess = createAction('[Order] Create Order Success', props<{ order: any }>());
export const createOrderFailure = createAction('[Order] Create Order Failure', props<{ error: string }>());

// ✅ Create Multiple Order Services (Bulk Insert)
export const createMultipleOrderServices = createAction('[Order] Create Multiple Order Services', props<{ orderServices: any[] }>());
export const createMultipleOrderServicesSuccess = createAction('[Order] Create Multiple Order Services Success', props<{ orderServices: any[] }>());
export const createMultipleOrderServicesFailure = createAction('[Order] Create Multiple Order Services Failure', props<{ error: string }>());

// Update Order
export const updateOrder = createAction('[Order] Update Order', props<{ order: any }>());
export const updateOrderSuccess = createAction('[Order] Update Order Success', props<{ order: any }>());
export const updateOrderFailure = createAction('[Order] Update Order Failure', props<{ error: string }>());

// Delete Order
export const deleteOrder = createAction('[Order] Delete Order', props<{ id: string }>());
export const deleteOrderSuccess = createAction('[Order] Delete Order Success', props<{ id: string }>());
export const deleteOrderFailure = createAction('[Order] Delete Order Failure', props<{ error: string }>());
