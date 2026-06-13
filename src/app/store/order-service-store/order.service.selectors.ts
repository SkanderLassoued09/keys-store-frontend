import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrderState } from './order.service.reducer';
import { WorkOrder } from './work-order.model';

export const selectOrderState = createFeatureSelector<OrderState>('order');
export const selectAllOrders = createSelector(selectOrderState, (state: OrderState) => state.orders);
export const selectOrderLoading = createSelector(selectOrderState, (state: OrderState) => state.loading);
export const selectOrderError = createSelector(selectOrderState, (state: OrderState) => state.error);
export const selectOrderById = (id: string) => createSelector(selectAllOrders, (orders) => orders.find((ord) => ord._id === id));

// Revenue helpers — single source of truth for the daily-money calculation.
// Each WorkOrder row already contains the line-item price, so revenue is a
// pure sum. Return WorkOrder rows carry negative prices, so totals naturally
// include refunded/replaced adjustments without a separate calculation path.
export const lineTotal = (o: WorkOrder): number => Number(o.price ?? 0);

export const isSameDay = (iso: string | undefined, ref: Date): boolean => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
};

export const selectTodayOrders = createSelector(selectAllOrders, (orders) => {
    const today = new Date();
    return orders.filter((o) => isSameDay(o.createdAt, today));
});

export const confirmedSales = (orders: WorkOrder[]): WorkOrder[] => orders;

export const totalRevenue = (orders: WorkOrder[]): number => orders.reduce((sum, o) => sum + lineTotal(o), 0);

export const selectTodayArticleOrders = createSelector(selectTodayOrders, (orders) => orders.filter((o) => (o.entryType ?? 'article') === 'article'));

export const selectTodayConfirmedOrders = createSelector(selectTodayOrders, (orders) => confirmedSales(orders));

export const selectTodayConfirmedRevenue = createSelector(selectTodayConfirmedOrders, (orders) => totalRevenue(orders));

export const selectTodayRevenue = createSelector(selectTodayOrders, (orders) => totalRevenue(orders));

export const selectTodayArticleRevenue = createSelector(selectTodayOrders, (orders) => orders.filter((o) => (o.entryType ?? 'article') === 'article').reduce((sum, o) => sum + lineTotal(o), 0));

export const selectTodayServiceRevenue = createSelector(selectTodayOrders, (orders) => orders.filter((o) => o.entryType === 'service').reduce((sum, o) => sum + lineTotal(o), 0));

export const selectOrdersByDateRange = (from: Date, to: Date) =>
    createSelector(selectAllOrders, (orders) =>
        orders.filter((o) => {
            if (!o.createdAt) return false;
            const t = new Date(o.createdAt).getTime();
            return t >= from.getTime() && t <= to.getTime();
        })
    );
