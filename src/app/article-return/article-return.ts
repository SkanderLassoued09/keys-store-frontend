import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import * as ArticleActions from '../store/article-store/article.actions';
import * as ArticleSelectors from '../store/article-store/article.selectors';
import * as EmployeeActions from '../store/employee-store/emloyee.actions';
import * as EmployeeSelectors from '../store/employee-store/employee.selectors';
import * as OrderActions from '../store/order-service-store/order.service.actions';
import * as OrderSelectors from '../store/order-service-store/order.service.selectors';
import * as ArticleReturnActions from '../store/article-return-store/article-return.actions';
import * as ArticleReturnSelectors from '../store/article-return-store/article-return.selectors';
import { ArticleReturnType } from '../store/article-return-store/article-return.model';

@Component({
    selector: 'app-article-return',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, DialogModule, InputNumberModule, InputTextModule, SelectModule, TableModule, TagModule, TextareaModule, ToastModule],
    templateUrl: './article-return.html',
    styleUrl: './article-return.scss'
})
export class ArticleReturn implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);

    dialogVisible = false;

    readonly returnTypeOptions = [
        { label: 'Repaired', value: 'REPAIRED' },
        { label: 'Replaced', value: 'REPLACED' },
        { label: 'Refunded', value: 'REFUNDED' }
    ];

    returnForm = new FormGroup({
        originalWorkOrder: new FormControl<string | null>(null),
        originalArticle: new FormControl<string | null>(null, Validators.required),
        customerName: new FormControl(''),
        employee: new FormControl<string | null>(null, Validators.required),
        returnType: new FormControl<ArticleReturnType>('REPAIRED', Validators.required),
        notes: new FormControl(''),
        repairAction: new FormControl(''),
        replacementArticle: new FormControl<string | null>(null),
        replacementQuantity: new FormControl<number | null>(1),
        refundedAmount: new FormControl<number | null>(0)
    });

    returns$ = this.store.select(ArticleReturnSelectors.selectAllArticleReturns);
    loading$ = this.store.select(ArticleReturnSelectors.selectArticleReturnLoading);
    articles$ = this.store.select(ArticleSelectors.selectAllArticles);
    employees$ = this.store.select(EmployeeSelectors.selectEmployeeDropdown);
    saleOptions$: Observable<any[]>;

    constructor() {
        this.saleOptions$ = combineLatest([this.store.select(OrderSelectors.selectAllOrders), this.articles$]).pipe(
            map(([orders, articles]) =>
                orders
                    .filter((order) => (order.entryType ?? 'article') === 'article')
                    .map((order) => {
                        const articleId = typeof order.article === 'string' ? order.article : order.article?._id;
                        const article = articles.find((a) => a._id === articleId);
                        return {
                            id: order._id,
                            label: `${order.name} - ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'date inconnue'}`,
                            articleId,
                            customerName: order.customerName ?? '',
                            articleName: article?.name ?? order.name
                        };
                    })
            )
        );
    }

    ngOnInit(): void {
        this.store.dispatch(ArticleReturnActions.loadArticleReturns());
        this.store.dispatch(ArticleActions.loadArticle());
        this.store.dispatch(EmployeeActions.loadEmployee());
        this.store.dispatch(OrderActions.loadOrder({}));

        this.actions$.pipe(ofType(ArticleReturnActions.createArticleReturnSuccess), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.dialogVisible = false;
            this.resetForm();
        });

        this.returnForm.get('returnType')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((type) => this.applyTypeValidators(type));
        this.applyTypeValidators(this.returnForm.get('returnType')?.value ?? 'REPAIRED');
    }

    openDialog(): void {
        this.resetForm();
        this.dialogVisible = true;
    }

    closeDialog(): void {
        this.dialogVisible = false;
    }

    onOriginalSaleChange(id: string | null, options: any[] | null): void {
        const option = (options ?? []).find((item) => item.id === id);
        if (!option) return;
        this.returnForm.patchValue({
            originalWorkOrder: option.id,
            originalArticle: option.articleId ?? null,
            customerName: option.customerName ?? ''
        });
    }

    saveReturn(): void {
        Object.keys(this.returnForm.controls).forEach((key) => this.returnForm.get(key)?.markAsTouched());
        if (this.returnForm.invalid) return;

        const value = this.returnForm.value;
        this.store.dispatch(
            ArticleReturnActions.createArticleReturn({
                payload: {
                    originalWorkOrder: value.originalWorkOrder || undefined,
                    originalArticle: value.originalArticle,
                    customerName: value.customerName || '',
                    employee: value.employee,
                    returnType: value.returnType,
                    notes: value.notes || '',
                    repairAction: value.returnType === 'REPAIRED' ? value.repairAction || '' : '',
                    replacementArticle: value.returnType === 'REPLACED' ? value.replacementArticle : undefined,
                    replacementQuantity: value.returnType === 'REPLACED' ? Number(value.replacementQuantity ?? 1) : 0,
                    refundedAmount: value.returnType === 'REFUNDED' ? Number(value.refundedAmount ?? 0) : 0
                }
            })
        );
    }

    displayArticle(article: any): string {
        if (!article) return '-';
        if (typeof article === 'string') return '-';
        return article.name || '-';
    }

    displayEmployee(employee: any): string {
        if (!employee) return '-';
        if (typeof employee === 'string') return '-';
        return `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() || employee.name || '-';
    }

    severity(type: ArticleReturnType): 'success' | 'info' | 'warn' {
        if (type === 'REPAIRED') return 'success';
        if (type === 'REPLACED') return 'info';
        return 'warn';
    }

    private resetForm(): void {
        this.returnForm.reset({
            originalWorkOrder: null,
            originalArticle: null,
            customerName: '',
            employee: null,
            returnType: 'REPAIRED',
            notes: '',
            repairAction: '',
            replacementArticle: null,
            replacementQuantity: 1,
            refundedAmount: 0
        });
        this.applyTypeValidators('REPAIRED');
    }

    private applyTypeValidators(type: ArticleReturnType | null): void {
        const repairAction = this.returnForm.get('repairAction');
        const replacementArticle = this.returnForm.get('replacementArticle');
        const replacementQuantity = this.returnForm.get('replacementQuantity');
        const refundedAmount = this.returnForm.get('refundedAmount');

        // Repair Action input was removed from the modal UI (kept as a backend
        // field). No longer required, so REPAIRED returns submit without it.
        repairAction?.setValidators([]);
        replacementArticle?.setValidators(type === 'REPLACED' ? [Validators.required] : []);
        replacementQuantity?.setValidators(type === 'REPLACED' ? [Validators.required, Validators.min(1)] : []);
        refundedAmount?.setValidators(type === 'REFUNDED' ? [Validators.required, Validators.min(0)] : []);

        repairAction?.updateValueAndValidity({ emitEvent: false });
        replacementArticle?.updateValueAndValidity({ emitEvent: false });
        replacementQuantity?.updateValueAndValidity({ emitEvent: false });
        refundedAmount?.updateValueAndValidity({ emitEvent: false });
    }
}
