import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as OrderActions from '../store/order-service-store/order.service.actions';
import * as OrderSelectors from '../store/order-service-store/order.service.selectors';
import * as ClientSelectors from '../store/client-store/client.selectors';
import * as ClientActions from '../store/client-store/client.actions';
import * as EmployeeSelectors from '../store/employee-store/employee.selectors';
// import * as EmployeeActions from '../store/employee-store/employee.actions';
// import * as MachineSelectors from '../store/machine-store/machine.selectors';
// import * as MachineActions from '../store/machine-store/machine.actions';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [
        TableModule,
        Dialog,
        SelectModule,
        ToastModule,
        ToolbarModule,
        ConfirmDialog,
        InputTextModule,
        TextareaModule,
        CommonModule,
        FileUpload,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        Button,
        ReactiveFormsModule,
        DialogModule,
        InputNumberModule,
        TagModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './order-service-list.html',
    styleUrl: './order-service-list.scss'
})
export class OrderList {
    // Dialog state
    orderDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    currentOrderId: string | null = null;

    // Status options - matching WorkOrder entity
    statusOptions = [
        { label: 'En attente', value: 'pending', severity: 'warning' },
        { label: 'En cours', value: 'in-progress', severity: 'info' },
        { label: 'Terminé', value: 'done', severity: 'success' }
    ];

    // Form - matching WorkOrder entity fields
    orderForm = new FormGroup({
        name: new FormControl('', Validators.required),
        description: new FormControl(''),
        price: new FormControl<number | null>(null, Validators.required),
        duration: new FormControl<number | null>(null),
        employee: new FormControl(''),
        client: new FormControl('', Validators.required),
        machine: new FormControl<string | null>(null),
        status: new FormControl('pending', Validators.required)
    });

    // NGRX Observables
    order$: Observable<any[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    client$: Observable<any[]> | undefined;
    employee$: Observable<any[]> | undefined;
    machine$: Observable<any[]> | undefined;

    constructor(private store: Store) {
        this.order$ = this.store.select(OrderSelectors.selectAllOrders);
        this.loading$ = this.store.select(OrderSelectors.selectOrderLoading);
        this.error$ = this.store.select(OrderSelectors.selectOrderError);
        this.client$ = this.store.select(ClientSelectors.selectClientFromDropdown);
        // this.employee$ = this.store.select(EmployeeSelectors.selectEmployeeFromDropdown);
        // this.machine$ = this.store.select(MachineSelectors.selectMachineFromDropdown);
    }

    ngOnInit() {
        this.store.dispatch(OrderActions.loadOrder());
        this.store.dispatch(ClientActions.loadClient());
        // this.store.dispatch(EmployeeActions.loadEmployee());
        // this.store.dispatch(MachineActions.loadMachine());
    }

    // Open dialog for creating new order
    openNew() {
        this.isEditMode = false;
        this.currentOrderId = null;
        this.orderForm.reset({
            status: 'pending',
            machine: null,
            duration: null
        });
        this.submitted = false;
        this.orderDialog = true;
    }

    // Open dialog for editing existing order
    editOrder(order: any) {
        this.isEditMode = true;
        this.currentOrderId = order._id;

        this.orderForm.patchValue({
            name: order.name,
            description: order.description,
            price: order.price,
            duration: order.duration,
            employee: order.employee,
            client: order.client,
            machine: order.machine || null,
            status: order.status
        });

        this.submitted = false;
        this.orderDialog = true;
    }

    // Save order (handles both create and update)
    saveOrder() {
        this.submitted = true;

        if (this.orderForm.invalid) {
            return;
        }

        if (this.isEditMode && this.currentOrderId) {
            // Update existing order
            this.store.dispatch(
                OrderActions.updateOrder({
                    order: {
                        id: this.currentOrderId,
                        ...this.orderForm.value
                    }
                })
            );
        } else {
            // Create new order
            this.store.dispatch(
                OrderActions.createOrder({
                    order: this.orderForm.value
                })
            );
        }

        this.hideDialog();
    }

    // Delete order
    deleteOrder(order: any) {
        this.store.dispatch(
            OrderActions.deleteOrder({
                id: order._id
            })
        );
    }

    // Hide dialog
    hideDialog() {
        this.orderDialog = false;
        this.submitted = false;
        this.isEditMode = false;
        this.currentOrderId = null;
        this.orderForm.reset({
            status: 'pending',
            machine: null,
            duration: null
        });
    }

    // Get dialog title dynamically
    getDialogTitle(): string {
        return this.isEditMode ? 'Modifier un ordre de travail' : 'Créer un ordre de travail';
    }

    // Get save button label dynamically
    getSaveButtonLabel(): string {
        return this.isEditMode ? 'Enregistrer' : "Créer l'ordre";
    }

    // Get status severity for tag
    getStatusSeverity(status: string): string {
        const option = this.statusOptions.find((s) => s.value === status);
        return option?.severity || 'info';
    }

    // Get status label
    getStatusLabel(status: string): string {
        const option = this.statusOptions.find((s) => s.value === status);
        return option?.label || status;
    }
}
