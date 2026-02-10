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
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as EmployeeActions from '../store/employee-store/emloyee.actions';
import * as EmployeeSelectors from '../store/employee-store/employee.selectors';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    selector: 'app-employee',
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
        InputTextModule,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        Button,
        ReactiveFormsModule,
        DatePickerModule,
        InputNumberModule
    ],
    providers: [MessageService, ConfirmationService, MessageService],
    templateUrl: './employee.html',
    styleUrl: './employee.scss'
})
export class Employee {
    // Dialog state
    employeeDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    currentEmployeeId: string | null = null;

    // Form
    employeeForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        phone: new FormControl(''),
        hireDate: new FormControl<Date | null>(null),
        salary: new FormControl<number | null>(null),
        isActive: new FormControl(true)
    });

    // NGRX Observables
    employee$: Observable<any[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;

    constructor(private store: Store) {
        this.employee$ = this.store.select(EmployeeSelectors.selectAllEmployees);
        this.loading$ = this.store.select(EmployeeSelectors.selectEmployeeLoading);
        this.error$ = this.store.select(EmployeeSelectors.selectEmployeeError);
    }

    ngOnInit() {
        this.store.dispatch(EmployeeActions.loadEmployee());
    }

    // Open dialog for creating new employee
    openNew() {
        this.isEditMode = false;
        this.currentEmployeeId = null;
        this.employeeForm.reset({ isActive: true });
        this.submitted = false;
        this.employeeDialog = true;
    }

    // Open dialog for editing existing employee
    editEmployee(employee: any) {
        this.isEditMode = true;
        this.currentEmployeeId = employee._id;

        this.employeeForm.patchValue({
            firstName: employee.firstName,
            lastName: employee.lastName,
            phone: employee.phone,
            hireDate: employee.hireDate ? new Date(employee.hireDate) : null,
            salary: employee.salary,
            isActive: employee.isActive ?? true
        });

        this.submitted = false;
        this.employeeDialog = true;
    }

    // Save employee (handles both create and update)
    saveEmployee() {
        this.submitted = true;

        if (this.employeeForm.invalid) {
            return;
        }

        if (this.isEditMode && this.currentEmployeeId) {
            // Update existing employee
            this.store.dispatch(
                EmployeeActions.updateEmployee({
                    employee: {
                        id: this.currentEmployeeId,
                        ...this.employeeForm.value
                    }
                })
            );
        } else {
            // Create new employee
            this.store.dispatch(
                EmployeeActions.createEmployee({
                    employee: this.employeeForm.value
                })
            );
        }

        this.hideDialog();
    }

    // Delete employee
    deleteEmployee(employee: any) {
        this.store.dispatch(
            EmployeeActions.deleteEmployee({
                id: employee._id
            })
        );
    }

    // Hide dialog
    hideDialog() {
        this.employeeDialog = false;
        this.submitted = false;
        this.isEditMode = false;
        this.currentEmployeeId = null;
        this.employeeForm.reset({ isActive: true });
    }

    // Get dialog title dynamically
    getDialogTitle(): string {
        return this.isEditMode ? 'Modifier un employé' : 'Créer un employé';
    }

    // Get save button label dynamically
    getSaveButtonLabel(): string {
        return this.isEditMode ? 'Enregistrer' : "Créer l'employé";
    }
}
