import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrderState } from './order.service.reducer';

export const selectOrderState = createFeatureSelector<OrderState>('order');
export const selectAllOrders = createSelector(selectOrderState, (state: OrderState) => state.orders);
export const selectOrderLoading = createSelector(selectOrderState, (state: OrderState) => state.loading);
export const selectOrderError = createSelector(selectOrderState, (state: OrderState) => state.error);
export const selectOrderById = (id: string) => createSelector(selectAllOrders, (orders) => orders.find((ord) => ord._id === id));
