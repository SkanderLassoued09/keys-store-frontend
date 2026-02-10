import { createReducer, on } from '@ngrx/store';
import * as OrderActions from './order.service.actions';

export interface OrderState {
    orders: any[];
    loading: boolean;
    error: string | null;
}

export const initialState: OrderState = {
    orders: [],
    loading: false,
    error: null
};

export const orderReducer = createReducer(
    initialState,

    // Load Orders
    on(OrderActions.loadOrder, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(OrderActions.loadOrderSuccess, (state, { orders }) => ({
        ...state,
        orders,
        loading: false,
        error: null
    })),

    on(OrderActions.loadOrderFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Create Order
    on(OrderActions.createOrder, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(OrderActions.createOrderSuccess, (state, { order }) => ({
        ...state,
        orders: [...state.orders, order],
        loading: false,
        error: null
    })),

    on(OrderActions.createOrderFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // ✅ Create Multiple Order Services
    on(OrderActions.createMultipleOrderServices, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(OrderActions.createMultipleOrderServicesSuccess, (state, { orderServices }) => ({
        ...state,
        orders: [...state.orders, ...orderServices],
        loading: false,
        error: null
    })),

    on(OrderActions.createMultipleOrderServicesFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Update Order
    on(OrderActions.updateOrder, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(OrderActions.updateOrderSuccess, (state, { order }) => ({
        ...state,
        orders: state.orders.map((ord) => (ord._id === order._id ? order : ord)),
        loading: false,
        error: null
    })),

    on(OrderActions.updateOrderFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Delete Order
    on(OrderActions.deleteOrder, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(OrderActions.deleteOrderSuccess, (state, { id }) => ({
        ...state,
        orders: state.orders.filter((ord) => ord._id !== id),
        loading: false,
        error: null
    })),

    on(OrderActions.deleteOrderFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
);
