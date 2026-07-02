import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { AppUser, UserService } from '@/layout/service/user.service';
import * as EmployeeActions from '../store/employee-store/emloyee.actions';
import * as EmployeeSelectors from '../store/employee-store/employee.selectors';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TableModule, TagModule, ToastModule, ToolbarModule, TooltipModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './users.html',
    styleUrl: './users.scss'
})
export class UsersPage implements OnInit {
    private readonly userService = inject(UserService);
    private readonly store = inject(Store);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly destroyRef = inject(DestroyRef);

    users: AppUser[] = [];
    loading = false;
    saving = false;

    createDialog = false;
    resetDialog = false;
    resetTarget: AppUser | null = null;

    employees$ = this.store.select(EmployeeSelectors.selectEmployeeDropdown);

    readonly roleOptions = [
        { label: 'Employé', value: 'employee' },
        { label: 'Propriétaire', value: 'admin' }
    ];

    createForm = new FormGroup({
        username: new FormControl('', [Validators.required, Validators.minLength(3)]),
        password: new FormControl('', [Validators.required, Validators.minLength(4)]),
        displayName: new FormControl(''),
        role: new FormControl<'admin' | 'employee'>('employee', Validators.required),
        employee: new FormControl<string | null>(null)
    });

    resetForm = new FormGroup({
        newPassword: new FormControl('', [Validators.required, Validators.minLength(4)])
    });

    ngOnInit(): void {
        this.store.dispatch(EmployeeActions.loadEmployee());
        this.load();
    }

    load(): void {
        this.loading = true;
        this.userService
            .getAll()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (users) => {
                    this.users = users;
                    this.loading = false;
                },
                error: (err) => {
                    this.loading = false;
                    this.toastError(err, 'Chargement des utilisateurs échoué');
                }
            });
    }

    // ===== Create =====
    openCreate(): void {
        this.createForm.reset({ username: '', password: '', displayName: '', role: 'employee', employee: null });
        this.createDialog = true;
    }

    create(): void {
        this.createForm.markAllAsTouched();
        if (this.createForm.invalid) return;
        this.saving = true;
        const v = this.createForm.value;
        this.userService
            .create({ username: v.username!, password: v.password!, role: v.role!, displayName: v.displayName || '', employee: v.employee || null })
            .subscribe({
                next: () => {
                    this.saving = false;
                    this.createDialog = false;
                    this.messageService.add({ severity: 'success', summary: 'Compte créé', detail: `"${v.username}" ajouté.`, life: 3000 });
                    this.load();
                },
                error: (err) => {
                    this.saving = false;
                    this.toastError(err, 'Création échouée');
                }
            });
    }

    // ===== Activate / deactivate =====
    toggleActive(user: AppUser): void {
        const next = !user.isActive;
        this.confirmationService.confirm({
            message: next ? `Réactiver le compte "${user.username}" ?` : `Désactiver le compte "${user.username}" ? Il ne pourra plus se connecter.`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                this.userService.update(user.id, { isActive: next }).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'info', summary: 'Mis à jour', detail: `"${user.username}" ${next ? 'réactivé' : 'désactivé'}.`, life: 3000 });
                        this.load();
                    },
                    error: (err) => this.toastError(err, 'Mise à jour échouée')
                });
            }
        });
    }

    // ===== Reset password =====
    openReset(user: AppUser): void {
        this.resetTarget = user;
        this.resetForm.reset({ newPassword: '' });
        this.resetDialog = true;
    }

    resetPassword(): void {
        this.resetForm.markAllAsTouched();
        if (this.resetForm.invalid || !this.resetTarget) return;
        this.saving = true;
        this.userService.update(this.resetTarget.id, { newPassword: this.resetForm.value.newPassword! }).subscribe({
            next: () => {
                this.saving = false;
                this.resetDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Mot de passe réinitialisé', detail: `Nouveau mot de passe défini pour "${this.resetTarget?.username}".`, life: 3000 });
            },
            error: (err) => {
                this.saving = false;
                this.toastError(err, 'Réinitialisation échouée');
            }
        });
    }

    roleLabel(role: string): string {
        return role === 'admin' ? 'Propriétaire' : 'Employé';
    }

    private toastError(err: any, fallback: string): void {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err?.error?.message || fallback, life: 4000 });
    }
}
