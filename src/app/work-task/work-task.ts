import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { WorkTask, WorkTaskStatus } from '@/layout/service/work-task.service';
import * as EmployeeActions from '../store/employee-store/emloyee.actions';
import * as EmployeeSelectors from '../store/employee-store/employee.selectors';
import * as TaskActions from '../store/work-task-store/work-task.actions';
import * as TaskSelectors from '../store/work-task-store/work-task.selectors';

@Component({
    selector: 'app-work-task',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TagModule, TextareaModule, ToastModule, ToolbarModule, DatePickerModule, ConfirmDialogModule, IconFieldModule, InputIconModule],
    providers: [ConfirmationService],
    templateUrl: './work-task.html',
    styleUrl: './work-task.scss'
})
export class WorkTaskPage implements OnInit {
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly destroyRef = inject(DestroyRef);

    // Kanban columns, in left→right order used by the move buttons.
    readonly columns: { status: WorkTaskStatus; label: string }[] = [
        { status: 'TODO', label: 'À faire' },
        { status: 'IN_PROGRESS', label: 'En cours' },
        { status: 'DONE', label: 'Terminé' },
        { status: 'CANCELLED', label: 'Annulé' }
    ];

    readonly statusOptions = this.columns.map((c) => ({ label: c.label, value: c.status }));
    readonly priorityOptions = [
        { label: 'Basse', value: 'low' },
        { label: 'Moyenne', value: 'medium' },
        { label: 'Haute', value: 'high' }
    ];

    allTasks: WorkTask[] = [];
    loading$ = this.store.select(TaskSelectors.selectTaskLoading);
    saving$ = this.store.select(TaskSelectors.selectTaskSaving);
    employees$ = this.store.select(EmployeeSelectors.selectEmployeeDropdown);

    // Filters
    searchTerm = '';
    filterEmployee: string | null = null;

    // Dialog
    dialogVisible = false;
    isEditMode = false;
    currentId: string | null = null;

    taskForm = new FormGroup({
        title: new FormControl('', Validators.required),
        description: new FormControl(''),
        status: new FormControl<WorkTaskStatus>('TODO', Validators.required),
        priority: new FormControl('medium'),
        employee: new FormControl<string | null>(null),
        dueDate: new FormControl<Date | null>(null)
    });

    ngOnInit(): void {
        this.store.dispatch(TaskActions.loadTasks());
        this.store.dispatch(EmployeeActions.loadEmployee());

        this.store
            .select(TaskSelectors.selectAllTasks)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((tasks) => (this.allTasks = tasks));

        this.actions$.pipe(ofType(TaskActions.createTaskSuccess, TaskActions.updateTaskSuccess), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.closeDialog());
    }

    // Tasks in a column after applying search + employee filter.
    tasksFor(status: WorkTaskStatus): WorkTask[] {
        const term = this.searchTerm.trim().toLowerCase();
        return this.allTasks.filter((t) => {
            if (t.status !== status) return false;
            if (this.filterEmployee && this.refId(t.employee) !== this.filterEmployee) return false;
            if (term && !(t.title || '').toLowerCase().includes(term)) return false;
            return true;
        });
    }

    // Move a card one column left/right through the status order.
    moveTask(task: WorkTask, direction: -1 | 1): void {
        const order = this.columns.map((c) => c.status);
        const idx = order.indexOf(task.status);
        const next = order[idx + direction];
        if (!next || !task._id) return;
        this.store.dispatch(TaskActions.updateTask({ id: task._id, payload: { status: next } }));
    }

    canMove(task: WorkTask, direction: -1 | 1): boolean {
        const order = this.columns.map((c) => c.status);
        const idx = order.indexOf(task.status);
        return !!order[idx + direction];
    }

    openNew(status: WorkTaskStatus = 'TODO'): void {
        this.isEditMode = false;
        this.currentId = null;
        this.taskForm.reset({ title: '', description: '', status, priority: 'medium', employee: null, dueDate: null });
        this.dialogVisible = true;
    }

    openEdit(task: WorkTask): void {
        this.isEditMode = true;
        this.currentId = task._id ?? null;
        this.taskForm.reset({
            title: task.title,
            description: task.description ?? '',
            status: task.status,
            priority: task.priority ?? 'medium',
            employee: this.refId(task.employee),
            dueDate: task.dueDate ? new Date(task.dueDate) : null
        });
        this.dialogVisible = true;
    }

    closeDialog(): void {
        this.dialogVisible = false;
        this.isEditMode = false;
        this.currentId = null;
    }

    save(): void {
        this.taskForm.markAllAsTouched();
        if (this.taskForm.invalid) return;
        const v = this.taskForm.value;
        const payload = {
            title: v.title ?? '',
            description: v.description ?? '',
            status: v.status as WorkTaskStatus,
            priority: v.priority ?? 'medium',
            employee: v.employee || undefined,
            dueDate: v.dueDate ? new Date(v.dueDate).toISOString() : undefined
        };
        if (this.isEditMode && this.currentId) {
            this.store.dispatch(TaskActions.updateTask({ id: this.currentId, payload }));
        } else {
            this.store.dispatch(TaskActions.createTask({ payload }));
        }
    }

    remove(task: WorkTask): void {
        if (!task._id) return;
        this.confirmationService.confirm({
            message: `Supprimer la tâche "${task.title}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.store.dispatch(TaskActions.deleteTask({ id: task._id as string }))
        });
    }

    displayEmployee(employee: any): string {
        if (!employee || typeof employee === 'string') return '—';
        return `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() || '—';
    }

    prioritySeverity(priority: string | undefined): 'danger' | 'warn' | 'secondary' {
        if (priority === 'high') return 'danger';
        if (priority === 'medium') return 'warn';
        return 'secondary';
    }

    private refId(value: any): string | null {
        if (!value) return null;
        if (typeof value === 'string') return value;
        return typeof value._id === 'string' ? value._id : null;
    }
}
