import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

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
import { selectUniqueCategories, selectUniqueTypes } from '../store/article-store/article.selectors';

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
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './order-service.html',
    styleUrls: ['./order-service.scss']
})
export class OrderService implements OnInit {
    // LocalStorage key
    private readonly STORAGE_KEY = 'selectedArticles';

    // Categories and types
    categories = [
        {
            id: 'house',
            name: 'Clé de Maison',
            icon: 'pi pi-home',
            types: ['UL50', 'UL51', 'CS206', 'Kale', 'DF1R', 'ISEO']
        },
        {
            id: 'car',
            name: 'Clé de Voiture',
            icon: 'pi pi-car',
            types: ['Auto', 'CarKey']
        },
        {
            id: 'service',
            name: 'Service',
            icon: 'pi pi-cog',
            types: ['Service', 'Copy']
        }
    ];

    keyTypes = [
        { code: 'UL50', label: 'UL50' },
        { code: 'UL51', label: 'UL51' },
        { code: 'CS206', label: 'CS206' },
        { code: 'Kale', label: 'Kale' },
        { code: 'DF1R', label: 'DF1R' },
        { code: 'ISEO', label: 'ISEO' }
    ];

    // State
    selectedCategory: string = 'house';
    selectedType: string = 'UL50';
    searchTerm: string = '';
    isSaving: boolean = false;

    // Modal state
    visible: boolean = false;
    articleSelectedForModal: any = null;

    // ✅ FORMARRAY for selected articles (RIGHT PANEL)
    selectedArticlesFormArray = new FormArray<FormGroup>([]);

    // Form for modal (when adding article)
    selectedArticleForm = new FormGroup({
        quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
        employee: new FormControl('', Validators.required),
        duration: new FormControl(0, Validators.min(1))
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
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    employee$: Observable<any[]>;
    categories$: Observable<any[]>;
    types$: Observable<any[]>;

    constructor(
        private store: Store,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.articles$ = this.store.select(ArticleSelectors.selectAllArticles);
        this.loading$ = this.store.select(ArticleSelectors.selectArticleLoading);
        this.error$ = this.store.select(ArticleSelectors.selectArticleError);
        this.employee$ = this.store.select(EmployeeSelectors.selectEmployeeDropdown);
        this.categories$ = this.store.select(selectUniqueCategories);
        this.types$ = this.store.select(selectUniqueTypes);
    }

    ngOnInit(): void {
        this.store.dispatch(ArticleActions.loadArticle());
        this.store.dispatch(EmployeeActions.loadEmployee());

        // ✅ Load articles from localStorage on init
        this.loadFromLocalStorage();

        this.calculateStats();

        // ✅ Subscribe to FormArray changes to auto-save to localStorage
        this.setupAutoSave();
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
        const formGroup = new FormGroup({
            id: new FormControl(article.id),
            name: new FormControl(article.name),
            reference: new FormControl(article.reference),
            type: new FormControl(article.type),
            quantity: new FormControl(article.quantity || 1, [Validators.required, Validators.min(1)]),
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

    // Format category name for UI
    formatCategorty(category: string): string {
        switch (category) {
            case 'KeyHome':
                return 'Clé de maison';
            case 'KeyCar':
                return 'Clé de voiture';
            default:
                return category;
        }
    }

    // ✅ Get FormGroup at specific index
    getArticleFormGroup(index: number): FormGroup {
        return this.selectedArticlesFormArray.at(index) as FormGroup;
    }

    // Category and type selection
    selectCategory(category: any): void {}

    selectType(typeCode: string): void {
        this.selectedType = typeCode;
    }

    get selectedCategoryName(): string {
        return this.categories.find((c) => c.id === this.selectedCategory)?.name || '';
    }

    get availableTypes(): any[] {
        const category = this.categories.find((c) => c.id === this.selectedCategory);
        if (!category) return [];
        return this.keyTypes.filter((type) => category.types.includes(type.code));
    }

    // Search
    onSearchChange(): void {}

    // Open modal for new work
    openNewWork(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Nouveau Travail',
            detail: 'Sélectionnez un article dans la liste ci-dessous'
        });
    }

    // ✅ Add article - open modal
    addArticle(article: any): void {
        this.articleSelectedForModal = article;

        // Reset modal form with default values
        this.selectedArticleForm.reset({
            quantity: 1,
            employee: '',
            duration: 0
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
            duration: 0
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
            quantity: formValues.quantity || 1,
            employee: formValues.employee || '', // ✅ CRITICAL: Employee ID
            employeeName: employee?.name || '', // ✅ CRITICAL: Employee Name
            duration: formValues.duration || 0,
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
            const employee = this.employeeList.find((e) => e.id === value.employee);

            return {
                // articleId: value.id,
                name: value.name,
                // articleReference: value.reference,
                // articleType: value.type,
                quantity: value.quantity,
                employee: value.employee,
                // employeeName: employee?.name || value.employeeName,
                duration: value.duration,
                // stockQuantity: value.stockQuantity,
                // sellingPrice: value.sellingPrice,
                price: value.quantity * value.sellingPrice
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

                // ✅ LOG 7: Before API call
                console.log('🚀 Sending to API:', articlesToSave);

                // Dispatch action to save to database
                this.store.dispatch(
                    OrderServiceActions.createMultipleOrderServices({
                        orderServices: articlesToSave
                    })
                );

                // ✅ Clear FormArray and localStorage after successful save
                this.selectedArticlesFormArray.clear();
                this.clearLocalStorage();
                this.calculateStats();
                this.isSaving = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Enregistré avec succès',
                    detail: `${articlesToSave.length} service(s) enregistré(s)`,
                    icon: 'pi pi-check-circle',
                    life: 5000
                });
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
