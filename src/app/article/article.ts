import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
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
import { Store } from '@ngrx/store';
import { selectProvidersForDropdown } from '@/store/provider-store/provider.selectors';

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
        ReactiveFormsModule
    ],
    providers: [MessageService, ConfirmationService, ProductService],
    templateUrl: './article.html',
    styleUrl: './article.scss'
})
export class Article {
    // Dialog state
    articleDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    currentArticleId: string | null = null;

    // Article Types
    articleTypes = [
        { value: 'Keys', label: 'Clés', icon: 'pi pi-key' },
        { value: 'CarKeys', label: 'Clés Auto', icon: 'pi pi-car' },
        { value: 'Remote', label: 'Télécommande', icon: 'pi pi-wifi' },
        { value: 'stamp', label: 'Tampon', icon: 'pi pi-bookmark' },
        { value: 'KeyChain', label: 'Porte-clés', icon: 'pi pi-link' },
        { value: 'Other', label: 'Autre', icon: 'pi pi-ellipsis-h' }
    ];

    // Categories depending on type
    aricleByType = {
        Keys: [
            { value: 'simple', label: 'Simple' },
            { value: 'a pointe', label: 'À pointe' },
            { value: 'double panneton', label: 'Double panneton' },
            { value: 'tubulaire', label: 'Tubulaire' }
        ],
        CarKeys: [
            { value: 'VVDI', label: 'VVDI' },
            { value: 'Smart VVDI', label: 'Smart VVDI' },
            { value: '433Mhz-commande', label: '433Mhz-commande' },
            { value: '315Mhz-commande', label: '315Mhz-commande' },
            { value: 'other', label: 'Autre' }
        ],
        Remote: [
            { value: 'universelle-bleu', label: 'Universelle Bleu' },
            { value: 'selca-L', label: 'Selca-L' },
            { value: 'selca-V', label: 'Selca-V' },
            { value: 'somfy', label: 'Somfy' },
            { value: 'sommer', label: 'Sommer' },
            { value: 'nice', label: 'Nice' },
            { value: 'bennica', label: 'Bennica' },
            { value: 'other', label: 'Autre' }
        ],
        stamp: [
            { value: '4911', label: '4911' },
            { value: '4912', label: '4912' },
            { value: '4913', label: '4913' },
            { value: 'R-30', label: 'R-30' },
            { value: 'R40', label: 'R40' },
            { value: 'dateur', label: 'Dateur' },
            { value: 'RIB', label: 'RIB' },
            { value: 'rubber', label: 'Rubber' },
            { value: 'other', label: 'Autre' }
        ],
        KeyChain: [
            { value: 'metal', label: 'Métal' },
            { value: 'plastic', label: 'Plastique' },
            { value: 'leather', label: 'Cuir' },
            { value: 'other', label: 'Autre' }
        ],
        Other: [{ value: 'other', label: 'Autre' }]
    } as any;

    // Selected categories array
    selectedArticleType = [];
    selectedCategories = [
        { value: 'KeyHome', label: 'Clé maison' },
        { value: 'KeyCar', label: 'Clé voiture' }
    ];

    providers: any[] = [];

    articleForm = new FormGroup({
        type: new FormControl('', Validators.required),
        articleType: new FormControl('', Validators.required),
        name: new FormControl('', Validators.required),
        reference: new FormControl(''),
        purchasePrice: new FormControl(null, Validators.required),
        sellingPrice: new FormControl(null, Validators.required),
        stockQuantity: new FormControl(null),
        shopQuantity: new FormControl(null),
        emplacement: new FormControl(''),
        fournisseur: new FormControl(''),
        category: new FormControl('')
    });

    // NGRX
    article$: Observable<any[]> | undefined;
    providers$: Observable<any[]> | undefined;
    loading$: Observable<boolean> | undefined;
    error$: Observable<string | null> | undefined;

    constructor(private store: Store) {
        this.article$ = this.store.select(ArticleSelectors.selectAllArticles);
        this.loading$ = this.store.select(ArticleSelectors.selectArticleLoading);
        this.error$ = this.store.select(ArticleSelectors.selectArticleError);
        this.providers$ = this.store.select(selectProvidersForDropdown);
    }

    ngOnInit() {
        this.store.dispatch(ArticleAction.loadArticle());
        this.store.dispatch(ProviderAction.loadProvider());
    }

    // Open dialog for creating new article
    openNew() {
        this.isEditMode = false;
        this.currentArticleId = null;
        this.articleForm.reset();
        this.submitted = false;
        this.articleDialog = true;
    }
    onTypeChange(typeValue: string) {
        this.selectedArticleType = this.aricleByType[typeValue] || [];
        this.articleForm.patchValue({ category: null }); // reset category selection
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
            fournisseur: article.fournisseur
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

    // Get margin CSS class
    getMarginClass(): string {
        const margin = this.calculateMargin();
        if (margin === null) return '';
        if (margin < 10) return 'profit-low';
        if (margin < 30) return 'profit-medium';
        return 'profit-high';
    }
}
