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
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { LedgerType } from '@/layout/service/employee-ledger.service';
import * as ArticleActions from '../store/article-store/article.actions';
import * as ArticleSelectors from '../store/article-store/article.selectors';
import * as EmployeeActions from '../store/employee-store/emloyee.actions';
import * as EmployeeSelectors from '../store/employee-store/employee.selectors';
import * as LedgerActions from '../store/employee-ledger-store/employee-ledger.actions';
import * as LedgerSelectors from '../store/employee-ledger-store/employee-ledger.selectors';

@Component({
    selector: 'app-employee-ledger',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, DialogModule, InputNumberModule, InputTextModule, SelectModule, TableModule, TagModule, TextareaModule, ToastModule, ToolbarModule, DatePickerModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    templateUrl: './employee-ledger.html',
    styleUrl: './employee-ledger.scss'
})
export class EmployeeLedgerPage implements OnInit {
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly destroyRef = inject(DestroyRef);

    dialogVisible = false;

    readonly typeOptions = [
        { label: 'Emprunt de matériel', value: 'MATERIAL_BORROW' },
        { label: 'Usage personnel', value: 'PERSONAL_USE' },
        { label: 'Avance sur salaire', value: 'SALARY_ADVANCE' }
    ];

    entries$ = this.store.select(LedgerSelectors.selectAllLedger);
    loading$ = this.store.select(LedgerSelectors.selectLedgerLoading);
    saving$ = this.store.select(LedgerSelectors.selectLedgerSaving);
    employees$ = this.store.select(EmployeeSelectors.selectEmployeeDropdown);
    articles$ = this.store.select(ArticleSelectors.selectAllArticles);

    ledgerForm = new FormGroup({
        employee: new FormControl<string | null>(null, Validators.required),
        type: new FormControl<LedgerType>('MATERIAL_BORROW', Validators.required),
        article: new FormControl<string | null>(null),
        quantity: new FormControl<number | null>(1),
        amount: new FormControl<number | null>(0),
        notes: new FormControl(''),
        date: new FormControl<Date>(new Date())
    });

    ngOnInit(): void {
        this.store.dispatch(LedgerActions.loadLedger());
        this.store.dispatch(EmployeeActions.loadEmployee());
        this.store.dispatch(ArticleActions.loadArticle());

        this.actions$.pipe(ofType(LedgerActions.createLedgerSuccess), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.dialogVisible = false;
            this.resetForm();
        });

        this.ledgerForm.get('type')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((type) => this.applyTypeValidators(type));
        this.applyTypeValidators(this.ledgerForm.get('type')?.value ?? 'MATERIAL_BORROW');
    }

    get isSalaryAdvance(): boolean {
        return this.ledgerForm.get('type')?.value === 'SALARY_ADVANCE';
    }

    openDialog(): void {
        this.resetForm();
        this.dialogVisible = true;
    }

    closeDialog(): void {
        this.dialogVisible = false;
    }

    save(): void {
        this.ledgerForm.markAllAsTouched();
        if (this.ledgerForm.invalid) return;

        const v = this.ledgerForm.value;
        const isAdvance = v.type === 'SALARY_ADVANCE';
        this.store.dispatch(
            LedgerActions.createLedger({
                payload: {
                    employee: v.employee,
                    type: v.type as LedgerType,
                    article: isAdvance ? undefined : v.article,
                    quantity: isAdvance ? 0 : Number(v.quantity ?? 0),
                    amount: isAdvance ? Number(v.amount ?? 0) : 0,
                    notes: v.notes || '',
                    date: v.date ? new Date(v.date).toISOString() : undefined
                }
            })
        );
    }

    remove(entry: any): void {
        if (!entry._id) return;
        this.confirmationService.confirm({
            message: 'Supprimer ce mouvement ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.store.dispatch(LedgerActions.deleteLedger({ id: entry._id }))
        });
    }

    typeLabel(type: string): string {
        return this.typeOptions.find((t) => t.value === type)?.label ?? type;
    }

    typeSeverity(type: string): 'info' | 'warn' | 'danger' {
        if (type === 'SALARY_ADVANCE') return 'danger';
        if (type === 'PERSONAL_USE') return 'warn';
        return 'info';
    }

    displayEmployee(employee: any): string {
        if (!employee || typeof employee === 'string') return '-';
        return `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() || '-';
    }

    displayArticle(article: any): string {
        if (!article || typeof article === 'string') return '-';
        return article.name ?? '-';
    }

    private resetForm(): void {
        this.ledgerForm.reset({ employee: null, type: 'MATERIAL_BORROW', article: null, quantity: 1, amount: 0, notes: '', date: new Date() });
        this.applyTypeValidators('MATERIAL_BORROW');
    }

    private applyTypeValidators(type: LedgerType | null): void {
        const article = this.ledgerForm.get('article');
        const quantity = this.ledgerForm.get('quantity');
        const amount = this.ledgerForm.get('amount');
        const isAdvance = type === 'SALARY_ADVANCE';

        article?.setValidators(isAdvance ? [] : [Validators.required]);
        quantity?.setValidators(isAdvance ? [] : [Validators.required, Validators.min(1)]);
        amount?.setValidators(isAdvance ? [Validators.required, Validators.min(0.001)] : []);

        article?.updateValueAndValidity({ emitEvent: false });
        quantity?.updateValueAndValidity({ emitEvent: false });
        amount?.updateValueAndValidity({ emitEvent: false });
    }
}
