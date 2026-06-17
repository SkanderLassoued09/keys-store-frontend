import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as OrderActions from '../store/order-service-store/order.service.actions';
import * as OrderSelectors from '../store/order-service-store/order.service.selectors';
import * as ClientSelectors from '../store/client-store/client.selectors';
import * as ClientActions from '../store/client-store/client.actions';
import * as SettingsActions from '../store/settings-store/settings.actions';
import * as SettingsSelectors from '../store/settings-store/settings.selectors';
import { displayEmployee, refId, WorkOrder } from '../store/order-service-store/work-order.model';
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
        DatePickerModule,
        InputNumberModule,
        TagModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './order-service-list.html',
    styleUrl: './order-service-list.scss'
})
export class OrderList {
    private readonly destroyRef = inject(DestroyRef);

    // Dialog state
    orderDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    currentOrderId: string | null = null;

    // Commission modal (global service commission % — replaces the old page).
    commissionDialog: boolean = false;
    commissionForm = new FormGroup({
        serviceCommissionPercent: new FormControl<number | null>(0, [Validators.required, Validators.min(0)])
    });
    commissionSaving$: Observable<boolean>;

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
    order$: Observable<WorkOrder[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    client$: Observable<any[]> | undefined;
    employee$: Observable<any[]> | undefined;
    machine$: Observable<any[]> | undefined;
    // Financial-view aggregates (computed from the date-filtered order list).
    totalRevenue$: Observable<number>;
    salesCount$: Observable<number>;
    returnsCount$: Observable<number>;
    averageTicket$: Observable<number>;

    // Date-range filter. Bound to the range picker; quick-filter buttons set it.
    dateRange: Date[] = this.todayRange();
    activeQuickFilter: 'today' | 'yesterday' | 'week' | 'month' | 'custom' = 'today';
    private rangeSubject = new BehaviorSubject<{ from: Date; to: Date }>({ from: this.dateRange[0], to: this.dateRange[1] });

    // Template helper — handles populated object OR raw ObjectId string.
    readonly displayEmployee = displayEmployee;

    constructor(private store: Store) {
        this.order$ = combineLatest([this.store.select(OrderSelectors.selectAllOrders), this.rangeSubject]).pipe(
            map(([orders, range]) =>
                orders.filter((order) => {
                    if (!order.createdAt) return false;
                    const t = new Date(order.createdAt).getTime();
                    return t >= range.from.getTime() && t <= range.to.getTime();
                })
            )
        );
        this.totalRevenue$ = this.order$.pipe(map((orders) => OrderSelectors.totalRevenue(orders)));
        this.salesCount$ = this.order$.pipe(map((orders) => OrderSelectors.salesCount(orders)));
        this.returnsCount$ = this.order$.pipe(map((orders) => OrderSelectors.returnsCount(orders)));
        this.averageTicket$ = this.order$.pipe(map((orders) => OrderSelectors.averageTicket(orders)));
        this.loading$ = this.store.select(OrderSelectors.selectOrderLoading);
        this.error$ = this.store.select(OrderSelectors.selectOrderError);
        this.client$ = this.store.select(ClientSelectors.selectClientFromDropdown);
        this.commissionSaving$ = this.store.select(SettingsSelectors.selectSettingsSaving);
        // this.employee$ = this.store.select(EmployeeSelectors.selectEmployeeFromDropdown);
        // this.machine$ = this.store.select(MachineSelectors.selectMachineFromDropdown);

        // Keep the commission form in sync with the loaded settings.
        this.store
            .select(SettingsSelectors.selectServiceCommissionPercent)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((percent) => this.commissionForm.patchValue({ serviceCommissionPercent: Number(percent ?? 0) }, { emitEvent: false }));
    }

    // ===== Commission employé modal =====
    openCommissionDialog(): void {
        this.store.dispatch(SettingsActions.loadSettings());
        this.commissionDialog = true;
    }

    closeCommissionDialog(): void {
        this.commissionDialog = false;
    }

    saveCommission(): void {
        this.commissionForm.markAllAsTouched();
        if (this.commissionForm.invalid) return;
        this.store.dispatch(
            SettingsActions.updateSettings({
                settings: { serviceCommissionPercent: Number(this.commissionForm.value.serviceCommissionPercent ?? 0) }
            })
        );
        this.commissionDialog = false;
    }

    // Range picker change — only react once both ends are picked.
    onRangeChange(range: Date[] | null): void {
        if (!range || !range[0]) return;
        const from = new Date(range[0]);
        const to = new Date(range[1] ?? range[0]);
        this.activeQuickFilter = 'custom';
        this.applyRange(from, to);
    }

    // Quick filters — Today / Yesterday / This Week / This Month.
    quickFilter(kind: 'today' | 'yesterday' | 'week' | 'month'): void {
        this.activeQuickFilter = kind;
        const now = new Date();
        let from = new Date();
        let to = new Date();
        if (kind === 'today') {
            from = now;
            to = now;
        } else if (kind === 'yesterday') {
            from = new Date(now);
            from.setDate(now.getDate() - 1);
            to = new Date(from);
        } else if (kind === 'week') {
            // Monday → today
            const day = (now.getDay() + 6) % 7;
            from = new Date(now);
            from.setDate(now.getDate() - day);
            to = now;
        } else {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = now;
        }
        this.dateRange = [new Date(from), new Date(to)];
        this.applyRange(from, to);
    }

    ngOnInit() {
        this.applyRange(this.dateRange[0], this.dateRange[1]);
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
            employee: refId(order.employee) ?? '',
            client: refId(order.client) ?? '',
            machine: refId(order.machine),
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
    getStatusSeverity(status: string | undefined): string {
        const option = this.statusOptions.find((s) => s.value === status);
        return option?.severity || 'info';
    }

    // Normalise to day bounds, push to the client-side filter, and refetch the
    // matching window from the backend (same from/to API the shop uses).
    private applyRange(fromDate: Date, toDate: Date): void {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        this.rangeSubject.next({ from, to });
        this.store.dispatch(OrderActions.loadOrder({ filter: { from: from.toISOString(), to: to.toISOString() } }));
    }

    private todayRange(): Date[] {
        return [new Date(), new Date()];
    }

    // Get status label
    getStatusLabel(status: string | undefined): string {
        const option = this.statusOptions.find((s) => s.value === status);
        return option?.label || status || '-';
    }
}
