import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule, Button } from 'primeng/button';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { Dialog, DialogModule } from 'primeng/dialog';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as MachineActions from '../store/machine-store/machine.actions';
import * as MachineSelectors from '../store/machine-store/machine.selectors';
import * as ProviderSelectors from '../store/provider-store/provider.selectors';
import * as ProviderActions from '../store/provider-store/provider.actions';

@Component({
    selector: 'app-machine-list',
    standalone: true,
    imports: [
        TableModule,
        Dialog,
        SelectModule,
        ToastModule,
        ToolbarModule,
        ConfirmDialog,
        InputTextModule,
        CommonModule,
        FileUpload,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        Button,
        ReactiveFormsModule,
        DialogModule,
        TagModule,
        DatePickerModule,
        ButtonModule,
        ConfirmDialogModule,
        FileUploadModule,
        DatePicker
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './machine.html',
    styleUrl: './machine.scss'
})
export class MachineList {
    // Dialog state
    machineDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    currentMachineId: string | null = null;

    // Status options - matching Machine entity
    statusOptions = [
        { label: 'Actif', value: 'active', severity: 'success' },
        { label: 'Maintenance', value: 'maintenance', severity: 'warning' },
        { label: 'Retiré', value: 'retired', severity: 'danger' },
        { label: 'Vendu', value: 'sold', severity: 'info' }
    ];

    // Form - matching Machine entity fields
    machineForm = new FormGroup({
        name: new FormControl('', Validators.required),
        type: new FormControl(''),
        serialNumber: new FormControl(''),
        fournisseur: new FormControl(''),
        purchaseDate: new FormControl<Date | null>(null),
        status: new FormControl('active', Validators.required)
    });

    // NGRX Observables
    machine$: Observable<any[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    provider$: Observable<any[]> | undefined;

    constructor(private store: Store) {
        this.machine$ = this.store.select(MachineSelectors.selectAllMachines);
        this.loading$ = this.store.select(MachineSelectors.selectMachineLoading);
        this.error$ = this.store.select(MachineSelectors.selectMachineError);
        this.provider$ = this.store.select(ProviderSelectors.selectProvidersForDropdown);
    }

    ngOnInit() {
        this.store.dispatch(MachineActions.loadMachine());
        this.store.dispatch(ProviderActions.loadProvider());
    }

    // Open dialog for creating new machine
    openNew() {
        this.isEditMode = false;
        this.currentMachineId = null;
        this.machineForm.reset({
            status: 'active',
            purchaseDate: null
        });
        this.submitted = false;
        this.machineDialog = true;
    }

    // Open dialog for editing existing machine
    editMachine(machine: any) {
        this.isEditMode = true;
        this.currentMachineId = machine._id;

        this.machineForm.patchValue({
            name: machine.name,
            type: machine.type,
            serialNumber: machine.serialNumber,
            fournisseur: machine.fournisseur,
            purchaseDate: machine.purchaseDate ? new Date(machine.purchaseDate) : null,
            status: machine.status
        });

        this.submitted = false;
        this.machineDialog = true;
    }

    // Save machine (handles both create and update)
    saveMachine() {
        this.submitted = true;

        if (this.machineForm.invalid) {
            return;
        }

        if (this.isEditMode && this.currentMachineId) {
            // Update existing machine
            this.store.dispatch(
                MachineActions.updateMachine({
                    machine: {
                        id: this.currentMachineId,
                        ...this.machineForm.value
                    }
                })
            );
        } else {
            // Create new machine
            this.store.dispatch(
                MachineActions.createMachine({
                    machine: this.machineForm.value
                })
            );
        }

        this.hideDialog();
    }

    // Delete machine
    deleteMachine(machine: any) {
        console.log(machine);
        this.store.dispatch(
            MachineActions.deleteMachine({
                id: machine._id
            })
        );
    }

    // Hide dialog
    hideDialog() {
        this.machineDialog = false;
        this.submitted = false;
        this.isEditMode = false;
        this.currentMachineId = null;
        this.machineForm.reset({
            status: 'active',
            purchaseDate: null
        });
    }

    // Get dialog title dynamically
    getDialogTitle(): string {
        return this.isEditMode ? 'Modifier une machine' : 'Créer une machine';
    }

    // Get save button label dynamically
    getSaveButtonLabel(): string {
        return this.isEditMode ? 'Enregistrer' : 'Créer la machine';
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
