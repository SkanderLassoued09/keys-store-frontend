import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TextareaModule } from 'primeng/textarea';
import { displayEmployee, WorkOrder } from '../store/order-service-store/work-order.model';
import * as OrderServiceSelectors from '../store/order-service-store/order.service.selectors';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

// Store imports
import * as ArticleActions from '../store/article-store/article.actions';
import * as ArticleSelectors from '../store/article-store/article.selectors';
import * as EmployeeActions from '../store/employee-store/emloyee.actions';
import * as EmployeeSelectors from '../store/employee-store/employee.selectors';
import * as OrderServiceActions from '../store/order-service-store/order.service.actions';
import { selectUniqueTypes } from '../store/article-store/article.selectors';

@Component({
    selector: 'app-inventory-work',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        CardModule,
        DialogModule,
        DividerModule,
        InputNumberModule,
        SelectModule,
        TableModule,
        TagModule,
        ToolbarModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        ToastModule,
        ConfirmDialogModule,
        TooltipModule,
        TextareaModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './order-service.html',
    styleUrls: ['./order-service.scss']
})
export class OrderService implements OnInit {
    // LocalStorage key
    private readonly STORAGE_KEY = 'selectedArticles';

    // State
    selectedType: string | null = null;
    isSaving: boolean = false;

    // Modal state
    visible: boolean = false;
    articleSelectedForModal: any = null;

    // Service modal state (Phase C)
    serviceModalVisible: boolean = false;
    selectedServiceForm = new FormGroup({
        title: new FormControl('', Validators.required),
        description: new FormControl(''),
        employee: new FormControl('', Validators.required),
        duration: new FormControl(15, [Validators.required, Validators.min(1)]),
        price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
        // Per-service commission %. Snapshotted onto the WorkOrder line at confirm.
        commissionPercent: new FormControl<number | null>(0, [Validators.min(0)])
    });

    // Shop-of-the-day dialog state (Phase D)
    shopDialogVisible: boolean = false;

    // Template helper used by the shop-of-the-day table.
    readonly displayEmployee = displayEmployee;

    // Field initializer is an injection context, so inject() works here. We
    // pass this to takeUntilDestroyed() in ngOnInit (which is NOT an injection
    // context — calling takeUntilDestroyed() without a DestroyRef there throws
    // NG0203 at runtime, silently breaking the subscription).
    private readonly destroyRef = inject(DestroyRef);

    // ✅ FORMARRAY for selected articles (RIGHT PANEL)
    selectedArticlesFormArray = new FormArray<FormGroup>([]);

    // Form for modal (when adding article)
    selectedArticleForm = new FormGroup({
        quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
        employee: new FormControl('', Validators.required)
    });

    // Employee list
    employeeList = [
        { id: '1', name: 'Ahmed Ben Ali' },
        { id: '2', name: 'Sami Trabelsi' },
        { id: '3', name: 'Youssef Khaled' }
    ];

    // Statistics
    todayStats: number = 0;
    avgTime: number = 0;

    // Observables from store
    articles$: Observable<any[]>;
    featuredForType$: Observable<any[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    employee$: Observable<any[]>;
    types$: Observable<any[]>;
    todayOrders$: Observable<WorkOrder[]>;

    private selectedTypeSubject = new BehaviorSubject<string | null>(null);

    constructor(
        private store: Store,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private actions$: Actions
    ) {
        this.articles$ = this.store.select(ArticleSelectors.selectAllArticles);
        this.loading$ = this.store.select(ArticleSelectors.selectArticleLoading);
        this.error$ = this.store.select(ArticleSelectors.selectArticleError);
        this.employee$ = this.store.select(EmployeeSelectors.selectEmployeeDropdown);
        this.types$ = this.store.select(selectUniqueTypes);
        this.todayOrders$ = this.store.select(OrderServiceSelectors.selectTodayOrders);

        // Featured/quick-access banner: pinned articles, narrowed by selected
        // type when one is active. The MAIN articles table stays untouched
        // and always shows every article.
        this.featuredForType$ = combineLatest([this.articles$, this.selectedTypeSubject]).pipe(map(([articles, type]) => articles.filter((a) => a?.featured && (!type || a?.type === type))));
    }

    ngOnInit(): void {
        this.store.dispatch(ArticleActions.loadArticle());
        this.store.dispatch(EmployeeActions.loadEmployee());

        // ✅ Load articles from localStorage on init
        this.loadFromLocalStorage();

        this.calculateStats();

        // ✅ Subscribe to FormArray changes to auto-save to localStorage
        this.setupAutoSave();

        // Cart lifecycle is bound to the bulk-save outcome:
        //  - SUCCESS  → backend confirmed everything, stock decremented → clear cart
        //  - FAILURE  → keep cart so the user can fix and retry (toast comes from the effect)
        this.actions$
            .pipe(ofType(OrderServiceActions.createMultipleOrderServicesSuccess), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.selectedArticlesFormArray.clear();
                this.clearLocalStorage();
                this.calculateStats();
                this.isSaving = false;
            });

        this.actions$.pipe(ofType(OrderServiceActions.createMultipleOrderServicesFailure), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.isSaving = false;
        });
    }

    // ✅ Setup auto-save on FormArray value changes
    private setupAutoSave(): void {
        this.selectedArticlesFormArray.valueChanges.subscribe(() => {
            this.saveToLocalStorage();
        });
    }

    // ✅ Load articles from localStorage
    private loadFromLocalStorage(): void {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (savedData) {
                const articles = JSON.parse(savedData);

                // Clear existing FormArray
                this.selectedArticlesFormArray.clear();

                // Rebuild FormArray from saved data
                articles.forEach((article: any) => {
                    this.selectedArticlesFormArray.push(this.createArticleFormGroup(article));
                });

                console.log('✅ Loaded from localStorage:', articles.length, 'articles');
                console.log('📋 Loaded articles:', articles);
            }
        } catch (error) {
            console.error('❌ Error loading from localStorage:', error);
        }
    }

    // ✅ Save articles to localStorage
    private saveToLocalStorage(): void {
        try {
            const articles = this.selectedArticlesFormArray.controls.map((control) => control.value);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
            console.log('💾 Saved to localStorage:', articles.length, 'articles');
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
        }
    }

    // ✅ Clear localStorage
    private clearLocalStorage(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('🗑️ Cleared localStorage');
        } catch (error) {
            console.error('❌ Error clearing localStorage:', error);
        }
    }

    // ✅ Helper to create FormGroup for each article
    createArticleFormGroup(article: any): FormGroup {
        // Article rows clamp quantity to current stock. Service rows skip the
        // max validator — they have no stockQuantity concept.
        const isService = (article.entryType || 'article') === 'service';
        const quantityValidators = [Validators.required, Validators.min(1)];
        if (!isService && Number.isFinite(Number(article.stockQuantity))) {
            quantityValidators.push(Validators.max(Number(article.stockQuantity)));
        }

        const formGroup = new FormGroup({
            id: new FormControl(article.id),
            name: new FormControl(article.name),
            reference: new FormControl(article.reference),
            type: new FormControl(article.type),
            // Single source of truth for article-vs-service distinction.
            // Defaults to 'article' so localStorage entries written before this
            // field existed still load correctly.
            entryType: new FormControl(article.entryType || 'article'),
            quantity: new FormControl(article.quantity || 1, quantityValidators),
            employee: new FormControl(article.employee || '', Validators.required),
            employeeName: new FormControl(article.employeeName || ''),
            duration: new FormControl(article.duration || 0, Validators.min(0)),
            stockQuantity: new FormControl(article.stockQuantity),
            sellingPrice: new FormControl(article.sellingPrice),
            timestamp: new FormControl(article.timestamp || new Date())
        });

        // ✅ LOG: Verify form group creation
        console.log('🔧 Created FormGroup with employee:', {
            employee: article.employee,
            employeeName: article.employeeName
        });

        return formGroup;
    }

    // ✅ Get FormGroup at specific index
    getArticleFormGroup(index: number): FormGroup {
        return this.selectedArticlesFormArray.at(index) as FormGroup;
    }

    // Type selection — null clears the filter and shows every article.
    selectType(typeCode: string | null): void {
        this.selectedType = this.selectedType === typeCode ? null : typeCode;
        this.selectedTypeSubject.next(this.selectedType);
    }

    // Open modal for new work
    openNewWork(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Nouveau Travail',
            detail: 'Sélectionnez un article dans la liste ci-dessous'
        });
    }

    // ===== Service modal (Phase C) =====
    openServiceModal(): void {
        this.selectedServiceForm.reset({
            title: '',
            description: '',
            employee: '',
            duration: 15,
            price: null,
            commissionPercent: 0
        });
        this.serviceModalVisible = true;
    }

    // Live commission preview for the Créer Service modal.
    serviceCommissionPreview(): number {
        const price = Number(this.selectedServiceForm.get('price')?.value ?? 0);
        const percent = Number(this.selectedServiceForm.get('commissionPercent')?.value ?? 0);
        return Math.round(((price * percent) / 100) * 1000) / 1000;
    }

    closeServiceModal(): void {
        this.serviceModalVisible = false;
    }

    confirmServiceModal(): void {
        Object.keys(this.selectedServiceForm.controls).forEach((key) => {
            this.selectedServiceForm.get(key)?.markAsTouched();
        });

        if (this.selectedServiceForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'Veuillez remplir le titre, l\'employé, le temps et le prix.',
                life: 3000
            });
            return;
        }

        const v = this.selectedServiceForm.value;
        const formGroup = this.createServiceFormGroup({
            title: v.title,
            description: v.description,
            employee: v.employee,
            duration: v.duration,
            price: v.price,
            commissionPercent: v.commissionPercent
        });
        this.selectedArticlesFormArray.push(formGroup);

        this.messageService.add({
            severity: 'success',
            summary: 'Service ajouté',
            detail: `"${v.title}" ajouté à la commande`,
            life: 3000
        });

        this.closeServiceModal();
        this.calculateStats();
    }

    // FormGroup matching the right-panel layout but tagged as a service.
    // Service-specific fields (description, price) are kept here; the right
    // panel only renders price/duration when entryType === 'service'.
    createServiceFormGroup(service: any): FormGroup {
        return new FormGroup({
            id: new FormControl(null),
            name: new FormControl(service.title || '', Validators.required),
            reference: new FormControl(''),
            type: new FormControl(''),
            description: new FormControl(service.description || ''),
            entryType: new FormControl('service'),
            quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
            employee: new FormControl(service.employee || '', Validators.required),
            employeeName: new FormControl(''),
            duration: new FormControl(service.duration || 15, [Validators.required, Validators.min(0)]),
            stockQuantity: new FormControl(null),
            sellingPrice: new FormControl(0),
            price: new FormControl(service.price ?? 0, [Validators.required, Validators.min(0)]),
            commissionPercent: new FormControl(Number(service.commissionPercent ?? 0)),
            timestamp: new FormControl(new Date())
        });
    }

    // ===== Shop-of-the-day dialog (Phase D) =====
    openShopDialog(): void {
        // Refresh today's data each time the dialog opens; the selector filters by createdAt.
        this.store.dispatch(OrderServiceActions.loadOrder());
        this.shopDialogVisible = true;
    }

    closeShopDialog(): void {
        this.shopDialogVisible = false;
    }

    // ✅ Add article - open modal
    addArticle(article: any): void {
        this.articleSelectedForModal = article;

        // Stock-aware validator: max changes per article. Re-applied each time
        // the modal opens so the previous article's max doesn't leak.
        const max = Number(article?.stockQuantity ?? 0);
        const quantityCtrl = this.selectedArticleForm.get('quantity');
        quantityCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(max)]);
        quantityCtrl?.updateValueAndValidity({ emitEvent: false });

        // Reset modal form with default values
        this.selectedArticleForm.reset({
            quantity: 1,
            employee: ''
        });

        this.visible = true;
    }

    // ✅ Close modal
    closeModal(): void {
        this.visible = false;
        this.articleSelectedForModal = null;
        this.selectedArticleForm.reset({
            quantity: 1,
            employee: ''
        });
    }

    // ✅ Confirm modal and add to FormArray
    confirmModal(): void {
        // Mark all fields as touched to trigger validation display
        Object.keys(this.selectedArticleForm.controls).forEach((key) => {
            this.selectedArticleForm.get(key)?.markAsTouched();
        });

        if (this.selectedArticleForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'Veuillez remplir tous les champs obligatoires (Quantité et Employé)',
                icon: 'pi pi-exclamation-triangle',
                life: 3000
            });
            return;
        }

        const formValues = this.selectedArticleForm.value;

        // ✅ Find employee name from employee list
        const employee = this.employeeList.find((e) => e.id === formValues.employee);

        // ✅ LOG: Verify employee selection
        console.log('👤 Selected Employee:', {
            id: formValues.employee,
            name: employee?.name
        });

        // Create new article object with ALL required data
        const newItem = {
            id: this.articleSelectedForModal._id || this.articleSelectedForModal.id,
            name: this.articleSelectedForModal.name,
            reference: this.articleSelectedForModal.reference,
            type: this.articleSelectedForModal.type,
            entryType: 'article' as const,
            quantity: formValues.quantity || 1,
            employee: formValues.employee || '', // ✅ CRITICAL: Employee ID
            employeeName: employee?.name || '', // ✅ CRITICAL: Employee Name
            duration: 0,
            stockQuantity: this.articleSelectedForModal.stockQuantity,
            sellingPrice: this.articleSelectedForModal.sellingPrice,
            timestamp: new Date()
        };

        // ✅ LOG: Verify complete item before adding
        console.log('📝 Adding article to FormArray:', newItem);
        console.log('   - Employee ID:', newItem.employee);
        console.log('   - Employee Name:', newItem.employeeName);

        // ✅ Add to FormArray
        const newFormGroup = this.createArticleFormGroup(newItem);
        this.selectedArticlesFormArray.push(newFormGroup);

        // ✅ Verify FormGroup was added correctly
        console.log('✅ FormGroup added. Current employee value:', newFormGroup.get('employee')?.value);

        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: `Article "${newItem.name}" ajouté avec employé "${newItem.employeeName}"`,
            icon: 'pi pi-check-circle',
            life: 3000
        });

        this.closeModal();
        this.calculateStats();
    }

    // ✅ Remove article from FormArray
    removeArticle(index: number): void {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir retirer cet article?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.selectedArticlesFormArray.removeAt(index);
                this.calculateStats();

                this.messageService.add({
                    severity: 'info',
                    summary: 'Supprimé',
                    detail: 'Article retiré de la liste',
                    icon: 'pi pi-info-circle',
                    life: 3000
                });
            }
        });
    }

    // ✅ Clear all articles
    clearAllArticles(): void {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir vider toute la liste?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, vider',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.selectedArticlesFormArray.clear();
                this.clearLocalStorage();
                this.calculateStats();

                this.messageService.add({
                    severity: 'info',
                    summary: 'Liste vidée',
                    detail: 'Tous les articles ont été retirés',
                    icon: 'pi pi-trash',
                    life: 3000
                });
            }
        });
    }

    // ✅ CONFIRM ALL - Save to database with latest data from FormArray
    confirmAll(): void {
        if (this.selectedArticlesFormArray.length === 0) return;

        // ✅ LOG 1: Check raw FormArray
        console.log('🔍 RAW FormArray:', this.selectedArticlesFormArray);

        // ✅ LOG 2: Check FormArray controls
        console.log('🔍 FormArray Controls:', this.selectedArticlesFormArray.controls);

        // ✅ LOG 3: Check each control's value
        this.selectedArticlesFormArray.controls.forEach((control, index) => {
            console.log(`🔍 Article ${index + 1}:`, control.value);
            console.log(`   - Quantity: ${control.get('quantity')?.value}`);
            console.log(`   - Employee: ${control.get('employee')?.value}`);
            console.log(`   - Employee Name: ${control.get('employeeName')?.value}`);
            console.log(`   - Duration: ${control.get('duration')?.value}`);
        });

        // Validate all forms
        if (this.selectedArticlesFormArray.invalid) {
            const invalidIndexes: number[] = [];
            this.selectedArticlesFormArray.controls.forEach((control, index) => {
                if (control.invalid) {
                    invalidIndexes.push(index + 1);
                    // ✅ LOG 4: Check which controls are invalid
                    console.log(`❌ Invalid Article ${index + 1}:`, control.errors);
                    console.log(`   - Form Value:`, control.value);

                    // Check specific field errors
                    if (control.get('employee')?.invalid) {
                        console.log(`   ⚠️ Employee field is invalid`);
                    }
                }
            });

            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: `Article(s) ${invalidIndexes.join(', ')} : Veuillez remplir tous les champs obligatoires (notamment l'employé)`,
                icon: 'pi pi-exclamation-triangle',
                life: 5000
            });
            return;
        }

        // ✅ LOG 5: Check mapped data before saving
        const articlesToSave = this.selectedArticlesFormArray.controls.map((control) => {
            const value = control.value;
            const isService = value.entryType === 'service';

            return {
                name: value.name,
                description: value.description || '',
                quantity: value.quantity,
                employee: value.employee,
                duration: value.duration || 0,
                // Service price is set directly in the modal; article price is
                // unit selling-price × quantity.
                price: isService ? Number(value.price ?? 0) : value.quantity * (value.sellingPrice ?? 0),
                // entryType drives commission rate + revenue split server-side.
                // Falls back to 'article' for legacy localStorage entries.
                entryType: value.entryType || 'article',
                // Article reference is sent only for article entries; service
                // entries leave it null so the backend default applies.
                article: isService ? null : value.id,
                // Commission: services pass their per-line %, the backend snapshots
                // articles from the parent Article doc. calculatedPrime is always
                // recomputed server-side (don't trust the client for money).
                commissionPercent: isService ? Number(value.commissionPercent ?? 0) : 0
            };
        });

        // ✅ LOG 6: Final data to save
        console.log('📊 FINAL Data to save to database:', articlesToSave);
        console.log('📊 Number of items:', articlesToSave.length);
        console.log('📊 Formatted JSON:', JSON.stringify(articlesToSave, null, 2));

        this.confirmationService.confirm({
            message: `Confirmer l'enregistrement de ${articlesToSave.length} article(s)?`,
            header: 'Confirmation finale',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Confirmer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-success',
            accept: () => {
                this.isSaving = true;
                console.log('🚀 Sending to API:', articlesToSave);

                // Cart-clearing and toasts are handled by the success/failure
                // action subscriptions in ngOnInit. On failure the cart is
                // intentionally preserved so the user can adjust and retry.
                this.store.dispatch(
                    OrderServiceActions.createMultipleOrderServices({
                        orderServices: articlesToSave
                    })
                );
            }
        });
    }

    // ✅ Statistics
    private calculateStats(): void {
        const articles = this.selectedArticlesFormArray.controls.map((control) => control.value);
        this.todayStats = articles.length;

        if (articles.length > 0) {
            const totalTime = articles.reduce((sum, item) => sum + (item.duration || 0), 0);
            this.avgTime = Math.round(totalTime / articles.length);
        } else {
            this.avgTime = 0;
        }
    }
}
