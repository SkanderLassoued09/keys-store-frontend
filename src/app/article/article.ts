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

    // Article Types — value === label so the order-service left panel
    // (driven by selectUniqueTypes) shows real business labels.
    articleTypes = [
        { value: 'Clé maison', label: 'Clé maison', icon: 'pi pi-home' },
        { value: 'Clé voiture', label: 'Clé voiture', icon: 'pi pi-car' },
        { value: 'Télécommande', label: 'Télécommande', icon: 'pi pi-wifi' },
        { value: 'Tampon', label: 'Tampon', icon: 'pi pi-bookmark' },
        { value: 'Porte-clés', label: 'Porte-clés', icon: 'pi pi-link' },
        { value: 'Autre', label: 'Autre', icon: 'pi pi-ellipsis-h' }
    ];

    providers: any[] = [];

    articleForm = new FormGroup({
        type: new FormControl('', Validators.required),
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
    }

    ngOnInit() {
        this.store.dispatch(ArticleAction.loadArticle());
        this.store.dispatch(ProviderAction.loadProvider());

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

        if (this.isEditMode && this.currentArticleId) {
            // Update existing article
            this.store.dispatch(
                ArticleAction.updateArticle({
                    article: {
                        id: this.currentArticleId,
                        ...this.articleForm.value
                    }
                })
            );
        } else {
            // Create new article
            this.store.dispatch(
                ArticleAction.createArticle({
                    article: this.articleForm.value
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
        const price = Number(this.articleForm.get('sellingPrice')?.value ?? 0);
        const percent = Number(this.articleForm.get('commissionPercent')?.value ?? 0);
        return Math.round(((price * percent) / 100) * 1000) / 1000;
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
