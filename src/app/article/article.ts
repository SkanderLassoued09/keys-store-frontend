import { ChangeDetectorRef, Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { ButtonModule, Button } from 'primeng/button';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { RadioButton, RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { Dialog, DialogModule } from 'primeng/dialog';
import { Rating, RatingModule } from 'primeng/rating';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ToolbarModule } from 'primeng/toolbar';
import { Product, ProductService } from '@/pages/service/product.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormControl, FormControlName, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { Observable, tap } from 'rxjs';
import * as ArticleAction from '../store/article-store/article.actions';
import * as ProviderAction from '../store/provider-store/provider.actions';
import * as ArticleSelectors from '../store/article-store/article.selectors';
import * as TransferActions from '../store/stock-transfer-store/stock-transfer.actions';
import * as TransferSelectors from '../store/stock-transfer-store/stock-transfer.selectors';
import * as CategoryActions from '../store/category-store/category.actions';
import * as CategorySelectors from '../store/category-store/category.selectors';
import * as SubCategoryActions from '../store/sub-category-store/sub-category.actions';
import * as SubCategorySelectors from '../store/sub-category-store/sub-category.selectors';
import { Store } from '@ngrx/store';
import { selectProvidersForDropdown } from '@/store/provider-store/provider.selectors';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DatePipe } from '@angular/common';

export interface Article {
    name?: string;
    reference?: string;
    purchasePrice?: string;
    sellinPrice?: string;
    stockQuantity?: number;
    shopQuantity?: number;
    fournisseur?: string;
    type?: string;
    imcategoryage?: string;
}

@Component({
    selector: 'app-article',
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
        RadioButton,
        InputTextModule,
        FormsModule,
        InputNumber,
        IconFieldModule,
        InputIconModule,
        Button,
        ReactiveFormsModule,
        TooltipModule,
        TagModule
    ],
    providers: [MessageService, ConfirmationService, ProductService, DatePipe],
    templateUrl: './article.html',
    styleUrl: './article.scss'
})
export class Article {
    // Dialog state
    articleDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    currentArticleId: string | null = null;

    // Stock transfer modal state
    transferDialog: boolean = false;
    transferArticle: any = null;
    transferForm = new FormGroup({
        quantity: new FormControl<number | null>(1, [Validators.required, Validators.min(1)])
    });

    // Transfer history dialog state
    historyDialog: boolean = false;

    // Threshold below which the magasin badge fires.
    readonly LOW_SHOP_THRESHOLD = 3;

    // Field initializer is an injection context, so inject() works here. We
    // capture DestroyRef once and pass it explicitly to takeUntilDestroyed()
    // calls made later in ngOnInit (which is NOT an injection context).
    private readonly destroyRef = inject(DestroyRef);

    providers: any[] = [];

    // Dynamic classification (new). Additive — `type` below stays required so
    // existing article creation + POS grouping are unchanged.
    readonly fallbackImage =
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23e5e7eb"/><path d="M20 42l8-10 6 7 5-6 9 9H20z" fill="%239ca3af"/><circle cx="24" cy="24" r="5" fill="%239ca3af"/></svg>';

    // All categories / sub-categories, kept locally so the cascade can filter
    // and the table can resolve names without extra round-trips.
    allCategories: any[] = [];
    allSubCategories: any[] = [];

    // Category now replaces the legacy Type selector. `type` stays in the form
    // (and schema) but is no longer user-facing: it is derived from the chosen
    // category's name on save, keeping POS grouping + old articles working.
    articleForm = new FormGroup({
        type: new FormControl(''),
        category: new FormControl<string | null>(null, Validators.required),
        subCategory: new FormControl<string | null>(null),
        name: new FormControl('', Validators.required),
        reference: new FormControl(''),
        purchasePrice: new FormControl(null, Validators.required),
        sellingPrice: new FormControl(null, Validators.required),
        stockQuantity: new FormControl(null),
        shopQuantity: new FormControl(null),
        emplacement: new FormControl(''),
        fournisseur: new FormControl(''),
        featured: new FormControl(false),
        // Commission percentage applied per sale. Snapshotted onto each
        // WorkOrder line at confirmation; computed prime stays in DT.
        commissionPercent: new FormControl<number | null>(0, [Validators.min(0)])
    });

    // NGRX
    article$: Observable<any[]> | undefined;
    providers$: Observable<any[]> | undefined;
    loading$: Observable<boolean> | undefined;
    error$: Observable<string | null> | undefined;
    transfers$: Observable<any[]> | undefined;
    transferLoading$: Observable<boolean> | undefined;
    categories$: Observable<any[]> | undefined;

    constructor(
        private store: Store,
        private actions$: Actions
    ) {
        this.article$ = this.store.select(ArticleSelectors.selectAllArticles);
        this.loading$ = this.store.select(ArticleSelectors.selectArticleLoading);
        this.error$ = this.store.select(ArticleSelectors.selectArticleError);
        this.providers$ = this.store.select(selectProvidersForDropdown);
        this.transfers$ = this.store.select(TransferSelectors.selectAllTransfers);
        this.transferLoading$ = this.store.select(TransferSelectors.selectTransferLoading);
        this.categories$ = this.store.select(CategorySelectors.selectActiveCategories);
    }

    ngOnInit() {
        this.store.dispatch(ArticleAction.loadArticle());
        this.store.dispatch(ProviderAction.loadProvider());
        this.store.dispatch(CategoryActions.loadCategories());
        this.store.dispatch(SubCategoryActions.loadSubCategories({}));

        // Keep a local copy of all sub-categories so the article form's
        // Category → SubCategory cascade can filter without extra requests.
        this.store
            .select(SubCategorySelectors.selectAllSubCategories)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((list) => (this.allSubCategories = list));

        this.store
            .select(CategorySelectors.selectAllCategories)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((list) => (this.allCategories = list));

        // Close the transfer modal once the create succeeds; the article
        // store is auto-refreshed by the chained effect.
        // Note: takeUntilDestroyed() needs an explicit DestroyRef here because
        // ngOnInit is not an injection context — calling without one throws
        // NG0203 at runtime, silently breaking the subscription.
        this.actions$.pipe(ofType(TransferActions.createTransferSuccess), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.transferDialog = false;
            this.transferArticle = null;
            this.transferForm.reset({ quantity: 1 });
        });
    }

    // Open dialog for creating new article
    openNew() {
        this.isEditMode = false;
        this.currentArticleId = null;
        this.articleForm.reset();
        this.submitted = false;
        this.articleDialog = true;
    }

    // Open dialog for editing existing article
    editArticle(article: any) {
        console.log(article);
        this.isEditMode = true;
        this.currentArticleId = article._id;

        // Use patchValue to populate the form
        this.articleForm.patchValue({
            type: article.type,
            category: this.refId(article.category),
            subCategory: this.refId(article.subCategory),
            name: article.name,
            reference: article.reference,
            purchasePrice: article.purchasePrice,
            sellingPrice: article.sellingPrice,
            stockQuantity: article.stockQuantity,
            shopQuantity: article.shopQuantity,
            emplacement: article.emplacement,
            fournisseur: article.fournisseur,
            featured: article.featured ?? false,
            commissionPercent: article.commissionPercent ?? 0
        });

        this.applySubCategoryValidator();
        this.submitted = false;
        this.articleDialog = true;
    }

    // Save article (handles both create and update)
    saveArticle() {
        console.log('value', this.articleForm.value);
        console.log('this.articleForm.value', this.articleForm.value);
        this.submitted = true;

        if (this.articleForm.invalid) {
            return;
        }

        // Derive the legacy `type` from the chosen category's name so POS
        // grouping (selectUniqueTypes) and any old type-based logic keep
        // working even though the Type field is no longer shown.
        const selectedCategory = this.allCategories.find((c) => c._id === this.articleForm.get('category')?.value);
        const payload = {
            ...this.articleForm.value,
            type: selectedCategory?.name ?? this.articleForm.get('type')?.value ?? ''
        };

        if (this.isEditMode && this.currentArticleId) {
            // Update existing article
            this.store.dispatch(
                ArticleAction.updateArticle({
                    article: {
                        id: this.currentArticleId,
                        ...payload
                    }
                })
            );
        } else {
            // Create new article
            this.store.dispatch(
                ArticleAction.createArticle({
                    article: payload
                })
            );
        }

        this.hideDialog();
    }

    // Keep for backward compatibility (can be removed)
    onCreateArticle() {
        this.saveArticle();
    }

    // ===== Stock transfer =====

    openTransferDialog(article: any) {
        this.transferArticle = article;

        // Stock-aware max validator: refresh per article so the previous
        // article's max doesn't leak into a new dialog.
        const max = Number(article?.stockQuantity ?? 0);
        const qtyCtrl = this.transferForm.get('quantity');
        qtyCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(max)]);
        qtyCtrl?.updateValueAndValidity({ emitEvent: false });

        this.transferForm.reset({ quantity: 1 });
        this.transferDialog = true;
    }

    closeTransferDialog() {
        this.transferDialog = false;
        this.transferArticle = null;
    }

    // Quick-shortcut buttons (+1 / +5 / +10 / Max).
    bumpTransfer(delta: number | 'max') {
        if (!this.transferArticle) return;
        const max = Number(this.transferArticle.stockQuantity ?? 0);
        const ctrl = this.transferForm.get('quantity');
        if (delta === 'max') {
            ctrl?.setValue(max);
            return;
        }
        const next = Math.min(max, Math.max(1, Number(ctrl?.value ?? 0) + delta));
        ctrl?.setValue(next);
    }

    confirmTransfer() {
        if (!this.transferArticle) return;
        Object.keys(this.transferForm.controls).forEach((k) => this.transferForm.get(k)?.markAsTouched());
        if (this.transferForm.invalid) return;

        const v = this.transferForm.value;
        this.store.dispatch(
            TransferActions.createTransfer({
                payload: {
                    articleId: this.transferArticle._id,
                    quantity: Number(v.quantity)
                }
            })
        );
    }

    // Preview helpers used by the modal.
    previewNewStock(): number | null {
        if (!this.transferArticle) return null;
        const qty = Number(this.transferForm.get('quantity')?.value ?? 0);
        return Number(this.transferArticle.stockQuantity ?? 0) - qty;
    }

    previewNewShop(): number | null {
        if (!this.transferArticle) return null;
        const qty = Number(this.transferForm.get('quantity')?.value ?? 0);
        return Number(this.transferArticle.shopQuantity ?? 0) + qty;
    }

    // ===== Transfer history =====

    openHistoryDialog() {
        this.store.dispatch(TransferActions.loadTransfers());
        this.historyDialog = true;
    }

    closeHistoryDialog() {
        this.historyDialog = false;
    }

    formatEmployee(emp: any): string {
        if (!emp) return '—';
        if (typeof emp === 'string') return '—';
        return `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim() || '—';
    }

    formatArticleName(article: any): string {
        if (!article) return '—';
        if (typeof article === 'string') return '—';
        return article.name ?? '—';
    }

    isShopLow(qty: number | null | undefined): boolean {
        return Number(qty ?? 0) <= this.LOW_SHOP_THRESHOLD;
    }

    // Delete article
    deleteArticle(article: any) {
        this.store.dispatch(
            ArticleAction.deleteArticle({
                id: article._id
            })
        );
    }

    // Hide dialog
    hideDialog() {
        this.articleDialog = false;
        this.submitted = false;
        this.isEditMode = false;
        this.currentArticleId = null;
        this.articleForm.reset();
    }

    // ===== Dynamic category → sub-category cascade =====

    // Ref fields can be a populated object OR a raw id string.
    private refId(value: any): string | null {
        if (!value) return null;
        if (typeof value === 'string') return value;
        return typeof value._id === 'string' ? value._id : null;
    }

    // Image grid selection. Changing the category clears the sub-category.
    selectCategory(categoryId: string | null | undefined): void {
        if (!categoryId || this.articleForm.get('category')?.value === categoryId) return;
        this.articleForm.patchValue({ category: categoryId, subCategory: null });
        this.applySubCategoryValidator();
    }

    // Sub-categories belonging to the currently selected category.
    get filteredSubCategories(): any[] {
        const categoryId = this.articleForm.get('category')?.value;
        if (!categoryId) return [];
        return this.allSubCategories.filter((s) => s.active !== false && this.refId(s.category) === categoryId);
    }

    // Require a sub-category only when the chosen category actually has some,
    // so a category without sub-categories never blocks article creation.
    private applySubCategoryValidator(): void {
        const subCtrl = this.articleForm.get('subCategory');
        subCtrl?.setValidators(this.filteredSubCategories.length ? [Validators.required] : []);
        subCtrl?.updateValueAndValidity({ emitEvent: false });
    }

    // Table display: new articles show "Category › SubCategory"; legacy
    // articles without a category fall back to the old `type` string.
    displayClassification(article: any): string {
        if (!article?.category) return article?.type || '-';
        const catId = this.refId(article.category);
        const subId = this.refId(article.subCategory);
        const catName = this.allCategories.find((c) => c._id === catId)?.name ?? article?.type ?? '-';
        const subName = this.allSubCategories.find((s) => s._id === subId)?.name;
        return subName ? `${catName} › ${subName}` : catName;
    }

    onImgError(event: Event): void {
        (event.target as HTMLImageElement).src = this.fallbackImage;
    }

    // Get dialog title dynamically
    getDialogTitle(): string {
        return this.isEditMode ? 'Modifier un article' : 'Créer un article';
    }

    // Get save button label dynamically
    getSaveButtonLabel(): string {
        return this.isEditMode ? 'Enregistrer' : "Créer l'article";
    }

    // Calculate profit margin
    calculateMargin(): number | null {
        const purchase = this.articleForm.get('purchasePrice')?.value;
        const selling = this.articleForm.get('sellingPrice')?.value;

        if (!purchase || !selling || purchase === 0) return null;

        return Number((((selling - purchase) / purchase) * 100).toFixed(0));
    }

    // Live commission preview (DT). Used by the article modal preview card.
    articleCommissionPreview(): number {
        const purchase = Number(this.articleForm.get('purchasePrice')?.value ?? 0);
        const selling = Number(this.articleForm.get('sellingPrice')?.value ?? 0);
        const percent = Number(this.articleForm.get('commissionPercent')?.value ?? 0);
        const profit = selling - purchase;
        return Math.round(((profit * percent) / 100) * 1000) / 1000;
    }

    // Get margin CSS class
    getMarginClass(): string {
        const margin = this.calculateMargin();
        if (margin === null) return '';
        if (margin < 10) return 'profit-low';
        if (margin < 30) return 'profit-medium';
        return 'profit-high';
    }
}
