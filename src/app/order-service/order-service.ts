import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TextareaModule } from 'primeng/textarea';
import { displayEmployee, displayWorkOrderType, WorkOrder } from '../store/order-service-store/work-order.model';
import * as OrderServiceSelectors from '../store/order-service-store/order.service.selectors';
import { ArticleReturn } from '../article-return/article-return';

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
import * as CategoryActions from '../store/category-store/category.actions';
import * as CategorySelectors from '../store/category-store/category.selectors';
import * as SubCategoryActions from '../store/sub-category-store/sub-category.actions';
import * as SubCategorySelectors from '../store/sub-category-store/sub-category.selectors';

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
        TextareaModule,
        ArticleReturn
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

    // POS category/sub-category filtering + recents.
    private readonly RECENT_KEY = 'recentArticles';
    selectedCategoryId: string | null = null;
    selectedSubCategoryId: string | null = null;
    allCategories: any[] = [];
    allSubCategories: any[] = [];
    recentArticles: any[] = [];
    articleSearch = '';
    readonly fallbackImage =
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23e5e7eb"/><path d="M20 42l8-10 6 7 5-6 9 9H20z" fill="%239ca3af"/><circle cx="24" cy="24" r="5" fill="%239ca3af"/></svg>';
    private selectedCategorySubject = new BehaviorSubject<string | null>(null);
    private selectedSubCategorySubject = new BehaviorSubject<string | null>(null);
    private searchSubject = new BehaviorSubject<string>('');

    // Modal state
    visible: boolean = false;
    articleSelectedForModal: any = null;

    // Service modal state (Phase C)
    serviceModalVisible: boolean = false;
    selectedServiceForm = new FormGroup({
        title: new FormControl('', Validators.required),
        category: new FormControl('', Validators.required),
        description: new FormControl(''),
        employee: new FormControl('', Validators.required),
        duration: new FormControl(15, [Validators.required, Validators.min(1)]),
        price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)])
    });

    // Today's confirmed article sales dialog state.
    todayIncomeDialogVisible: boolean = false;

    // Embedded returns component — lets the prominent Shop Interface "Nouveau
    // Retour" button open its dialog directly.
    @ViewChild(ArticleReturn) private readonly articleReturnCmp?: ArticleReturn;

    openReturnDialog(): void {
        this.articleReturnCmp?.openDialog();
    }

    // Template helper used by the shop-of-the-day table.
    readonly displayEmployee = displayEmployee;
    readonly displayWorkOrderType = displayWorkOrderType;

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
        employee: new FormControl('', Validators.required),
        customerName: new FormControl('')
    });

    readonly serviceCategoryOptions = [
        { label: 'Clé voiture réparation', value: 'Clé voiture réparation' },
        { label: 'Déplacement voiture', value: 'Déplacement voiture' },
        { label: 'Déplacement maison', value: 'Déplacement maison' },
        { label: 'Réparation contact', value: 'Réparation contact' },
        { label: 'Autre', value: 'Autre' }
    ];

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
    filteredArticles$: Observable<any[]>;
    categories$: Observable<any[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    employee$: Observable<any[]>;
    types$: Observable<any[]>;
    todayOrders$: Observable<WorkOrder[]>;
    todayRevenue$: Observable<number>;

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
        this.todayOrders$ = this.store.select(OrderServiceSelectors.selectTodayConfirmedOrders);
        this.todayRevenue$ = this.store.select(OrderServiceSelectors.selectTodayConfirmedRevenue);

        this.categories$ = this.store.select(CategorySelectors.selectActiveCategories);

        // Featured/quick-access banner: pinned articles, narrowed by selected
        // type when one is active. The MAIN articles table stays untouched
        // and always shows every article.
        this.featuredForType$ = combineLatest([this.articles$, this.selectedTypeSubject]).pipe(map(([articles, type]) => articles.filter((a) => a?.featured && (!type || a?.type === type))));

        // POS card grid: filter by selected Category → SubCategory and a free
        // text search over name + reference. No filters → all articles.
        this.filteredArticles$ = combineLatest([this.articles$, this.selectedCategorySubject, this.selectedSubCategorySubject, this.searchSubject]).pipe(
            map(([articles, categoryId, subCategoryId, search]) => {
                const term = (search || '').trim().toLowerCase();
                return articles.filter((a) => {
                    if (categoryId && this.refId(a?.category) !== categoryId) return false;
                    if (subCategoryId && this.refId(a?.subCategory) !== subCategoryId) return false;
                    if (term) {
                        const hay = `${a?.name ?? ''} ${a?.reference ?? ''}`.toLowerCase();
                        if (!hay.includes(term)) return false;
                    }
                    return true;
                });
            })
        );
    }

    private refId(value: any): string | null {
        if (!value) return null;
        if (typeof value === 'string') return value;
        return typeof value._id === 'string' ? value._id : null;
    }

    ngOnInit(): void {
        this.store.dispatch(ArticleActions.loadArticle());
        this.store.dispatch(EmployeeActions.loadEmployee());
        this.store.dispatch(CategoryActions.loadCategories());
        this.store.dispatch(SubCategoryActions.loadSubCategories({}));

        // Keep local copies of categories/sub-categories for filtering + images.
        this.store.select(CategorySelectors.selectActiveCategories).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((list) => (this.allCategories = list));
        this.store.select(SubCategorySelectors.selectAllSubCategories).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((list) => (this.allSubCategories = list));

        this.loadRecentArticles();

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
        // Article rows clamp quantity to current magasin stock. Service rows
        // skip the max validator because they have no stock concept.
        const isService = (article.entryType || 'article') === 'service';
        const availableStock = Number(article.shopQuantity ?? article.stockQuantity ?? 0);
        const quantityValidators = [Validators.required, Validators.min(1)];
        if (!isService && Number.isFinite(availableStock)) {
            quantityValidators.push(Validators.max(availableStock));
        }

        const formGroup = new FormGroup({
            id: new FormControl(article.id),
            name: new FormControl(article.name),
            reference: new FormControl(article.reference),
            type: new FormControl(article.type),
            category: new FormControl(article.category || '', isService ? Validators.required : []),
            description: new FormControl(article.description || ''),
            // Single source of truth for article-vs-service distinction.
            // Defaults to 'article' so localStorage entries written before this
            // field existed still load correctly.
            entryType: new FormControl(article.entryType || 'article'),
            quantity: new FormControl(article.quantity || 1, quantityValidators),
            employee: new FormControl(article.employee || '', Validators.required),
            employeeName: new FormControl(article.employeeName || ''),
            customerName: new FormControl(article.customerName || '', this.isCarKeyType(article.type) ? Validators.required : []),
            duration: new FormControl(article.duration || 0, Validators.min(0)),
            stockQuantity: new FormControl(availableStock),
            shopQuantity: new FormControl(article.shopQuantity ?? availableStock),
            sellingPrice: new FormControl(article.sellingPrice),
            price: new FormControl(article.price ?? 0, isService ? [Validators.required, Validators.min(0)] : []),
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

    // ===== POS category / sub-category filtering =====

    // Click a category card (or "Toutes") to filter the article grid. Toggling
    // off / switching category clears the sub-category.
    selectCategory(categoryId: string | null): void {
        this.selectedCategoryId = this.selectedCategoryId === categoryId ? null : categoryId;
        this.selectedSubCategoryId = null;
        this.selectedCategorySubject.next(this.selectedCategoryId);
        this.selectedSubCategorySubject.next(null);
    }

    selectSubCategory(subCategoryId: string | null): void {
        this.selectedSubCategoryId = this.selectedSubCategoryId === subCategoryId ? null : subCategoryId;
        this.selectedSubCategorySubject.next(this.selectedSubCategoryId);
    }

    // Sub-categories of the currently selected category (chips row).
    get subCategoriesForSelected(): any[] {
        if (!this.selectedCategoryId) return [];
        return this.allSubCategories.filter((s) => s.active !== false && this.refId(s.category) === this.selectedCategoryId);
    }

    onPosSearch(value: string): void {
        this.articleSearch = value;
        this.searchSubject.next(value);
    }

    // Resolve a display image for an article from its category (articles have
    // no own image), falling back to a placeholder.
    categoryImageFor(article: any): string {
        const catId = this.refId(article?.category);
        const cat = this.allCategories.find((c) => c._id === catId);
        return cat?.image || this.fallbackImage;
    }

    onImgError(event: Event): void {
        (event.target as HTMLImageElement).src = this.fallbackImage;
    }

    // ===== Recently used articles (localStorage strip) =====
    private loadRecentArticles(): void {
        try {
            const raw = localStorage.getItem(this.RECENT_KEY);
            this.recentArticles = raw ? JSON.parse(raw) : [];
        } catch {
            this.recentArticles = [];
        }
    }

    private pushRecentArticle(article: any): void {
        if (!article) return;
        const id = article._id ?? article.id;
        if (!id) return;
        const slim = { _id: id, name: article.name, reference: article.reference, type: article.type, category: this.refId(article.category), shopQuantity: article.shopQuantity, sellingPrice: article.sellingPrice };
        this.recentArticles = [slim, ...this.recentArticles.filter((a) => a._id !== id)].slice(0, 8);
        try {
            localStorage.setItem(this.RECENT_KEY, JSON.stringify(this.recentArticles));
        } catch {
            /* ignore quota errors */
        }
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
            category: '',
            description: '',
            employee: '',
            duration: 15,
            price: null
        });
        this.serviceModalVisible = true;
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
                detail: 'Veuillez remplir le titre, la catégorie, l\'employé, le temps et le prix.',
                life: 3000
            });
            return;
        }

        const v = this.selectedServiceForm.value;
        const formGroup = this.createServiceFormGroup({
            title: v.title,
            category: v.category,
            description: v.description,
            employee: v.employee,
            duration: v.duration,
            price: v.price
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
            category: new FormControl(service.category || '', Validators.required),
            description: new FormControl(service.description || ''),
            entryType: new FormControl('service'),
            quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
            employee: new FormControl(service.employee || '', Validators.required),
            employeeName: new FormControl(''),
            duration: new FormControl(service.duration || 15, [Validators.required, Validators.min(0)]),
            stockQuantity: new FormControl(null),
            sellingPrice: new FormControl(0),
            price: new FormControl(service.price ?? 0, [Validators.required, Validators.min(0)]),
            timestamp: new FormControl(new Date())
        });
    }

    // ===== Today's Income dialog =====
    openTodayIncomeDialog(): void {
        // Refresh today's data each time the dialog opens; backend and selector both use createdAt.
        this.store.dispatch(OrderServiceActions.loadOrder({ filter: this.todayFilter() }));
        this.todayIncomeDialogVisible = true;
    }

    closeTodayIncomeDialog(): void {
        this.todayIncomeDialogVisible = false;
    }

    private todayFilter(): { from: string; to: string } {
        const from = new Date();
        from.setHours(0, 0, 0, 0);
        const to = new Date();
        to.setHours(23, 59, 59, 999);
        return {
            from: from.toISOString(),
            to: to.toISOString()
        };
    }

    // ✅ Add article - open modal
    addArticle(article: any): void {
        this.articleSelectedForModal = article;
        this.pushRecentArticle(article);

        // Stock-aware validator: max changes per article. Re-applied each time
        // the modal opens so the previous article's max doesn't leak.
        const max = Number(article?.shopQuantity ?? 0);
        const quantityCtrl = this.selectedArticleForm.get('quantity');
        quantityCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(max)]);
        quantityCtrl?.updateValueAndValidity({ emitEvent: false });
        this.updateCustomerNameValidator(article);

        // Reset modal form with default values
        this.selectedArticleForm.reset({
            quantity: 1,
            employee: '',
            customerName: ''
        });

        this.visible = true;
    }

    // ✅ Close modal
    closeModal(): void {
        this.visible = false;
        this.articleSelectedForModal = null;
        this.selectedArticleForm.reset({
            quantity: 1,
            employee: '',
            customerName: ''
        });
    }

    private isCarKeyType(type: unknown): boolean {
        return type === 'Clé de voiture' || type === 'Clé voiture';
    }

    isCarKeyArticle(article: any): boolean {
        return this.isCarKeyType(article?.type);
    }

    isCarKeySale(formGroup: FormGroup): boolean {
        return this.isCarKeyType(formGroup.get('type')?.value);
    }

    private updateCustomerNameValidator(article: any): void {
        const customerNameCtrl = this.selectedArticleForm.get('customerName');
        if (!customerNameCtrl) return;

        if (this.isCarKeyArticle(article)) {
            customerNameCtrl.setValidators([Validators.required]);
        } else {
            customerNameCtrl.clearValidators();
        }

        customerNameCtrl.updateValueAndValidity({ emitEvent: false });
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
                detail: 'Veuillez remplir tous les champs obligatoires (Quantité, Employé et Nom client si nécessaire)',
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
            customerName: formValues.customerName?.trim() || '',
            duration: 0,
            stockQuantity: this.articleSelectedForModal.shopQuantity ?? 0,
            shopQuantity: this.articleSelectedForModal.shopQuantity ?? 0,
            sellingPrice: this.articleSelectedForModal.sellingPrice,
            timestamp: new Date()
        };

        // ✅ LOG: Verify complete item before adding
        console.log('📝 Adding article to FormArray:', newItem);
        console.log('   - Employee ID:', newItem.employee);
        console.log('   - Employee Name:', newItem.employeeName);
        console.log('   - Customer Name:', newItem.customerName);

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
            console.log(`   - Customer Name: ${control.get('customerName')?.value}`);
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
                ...(isService ? { category: value.category } : {}),
                ...(!isService && value.customerName ? { customerName: String(value.customerName).trim() } : {})
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
