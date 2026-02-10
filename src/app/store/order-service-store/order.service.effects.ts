import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as OrderActions from './order.service.actions';
import { OrderService } from '@/layout/service/order-service.service';
import { MessageService } from 'primeng/api';

export const loadOrders$ = createEffect(
    (actions$ = inject(Actions), orderService = inject(OrderService)) => {
        return actions$.pipe(
            ofType(OrderActions.loadOrder),
            mergeMap(() =>
                orderService.getAll().pipe(
                    map((orders) => OrderActions.loadOrderSuccess({ orders })),
                    catchError((error) =>
                        of(
                            OrderActions.loadOrderFailure({
                                error: error.message || 'Failed to load orders'
                            })
                        )
                    )
                )
            )
        );
    },
    { functional: true }
);

export const createOrder$ = createEffect(
    (actions$ = inject(Actions), orderService = inject(OrderService), messageService = inject(MessageService)) => {
        return actions$.pipe(
            ofType(OrderActions.createOrder),
            mergeMap(({ order }) =>
                orderService.create(order).pipe(
                    map((createdOrder) => {
                        messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Commande créée avec succès',
                            life: 3000
                        });
                        return OrderActions.createOrderSuccess({ order: createdOrder });
                    }),
                    catchError((error) => {
                        messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Échec de la création de la commande',
                            life: 3000
                        });
                        return of(
                            OrderActions.createOrderFailure({
                                error: error.message || 'Failed to create order'
                            })
                        );
                    })
                )
            )
        );
    },
    { functional: true }
);

// ✅ Create Multiple Order Services Effect
export const createMultipleOrderServices$ = createEffect(
    (actions$ = inject(Actions), orderService = inject(OrderService), messageService = inject(MessageService)) => {
        return actions$.pipe(
            ofType(OrderActions.createMultipleOrderServices),
            mergeMap(({ orderServices }) =>
                orderService.createMultiple(orderServices).pipe(
                    map((createdOrderServices) => {
                        messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: `${createdOrderServices.length} service(s) enregistré(s) avec succès`,
                            life: 5000
                        });
                        return OrderActions.createMultipleOrderServicesSuccess({
                            orderServices: createdOrderServices
                        });
                    }),
                    catchError((error) => {
                        messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: "Échec de l'enregistrement des services",
                            life: 5000
                        });
                        return of(
                            OrderActions.createMultipleOrderServicesFailure({
                                error: error.message || 'Failed to create order services'
                            })
                        );
                    })
                )
            )
        );
    },
    { functional: true }
);

export const updateOrder$ = createEffect(
    (actions$ = inject(Actions), orderService = inject(OrderService), messageService = inject(MessageService)) => {
        return actions$.pipe(
            ofType(OrderActions.updateOrder),
            mergeMap(({ order }) =>
                orderService.update(order.id, order).pipe(
                    map((updatedOrder) => {
                        messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Commande modifiée avec succès',
                            life: 3000
                        });
                        return OrderActions.updateOrderSuccess({ order: updatedOrder });
                    }),
                    catchError((error) => {
                        messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Échec de la modification de la commande',
                            life: 3000
                        });
                        return of(
                            OrderActions.updateOrderFailure({
                                error: error.message || 'Failed to update order'
                            })
                        );
                    })
                )
            )
        );
    },
    { functional: true }
);

export const deleteOrder$ = createEffect(
    (actions$ = inject(Actions), orderService = inject(OrderService), messageService = inject(MessageService)) => {
        return actions$.pipe(
            ofType(OrderActions.deleteOrder),
            mergeMap(({ id }) =>
                orderService.delete(id).pipe(
                    map(() => {
                        messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Commande supprimée avec succès',
                            life: 3000
                        });
                        return OrderActions.deleteOrderSuccess({ id });
                    }),
                    catchError((error) => {
                        messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Échec de la suppression de la commande',
                            life: 3000
                        });
                        return of(
                            OrderActions.deleteOrderFailure({
                                error: error.message || 'Failed to delete order'
                            })
                        );
                    })
                )
            )
        );
    },
    { functional: true }
);
