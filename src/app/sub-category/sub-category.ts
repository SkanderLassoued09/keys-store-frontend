import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { SubCategory } from '@/layout/service/sub-category.service';
import * as CategoryActions from '../store/category-store/category.actions';
import * as CategorySelectors from '../store/category-store/category.selectors';
import * as SubCategoryActions from '../store/sub-category-store/sub-category.actions';
import * as SubCategorySelectors from '../store/sub-category-store/sub-category.selectors';

@Component({
    selector: 'app-sub-category',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TableModule, TagModule, ToastModule, ToolbarModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    templateUrl: './sub-category.html',
    styleUrl: './sub-category.scss'
})
export class SubCategoryPage implements OnInit {
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly destroyRef = inject(DestroyRef);

    dialogVisible = false;
    isEditMode = false;
    currentId: string | null = null;

    subCategories$ = this.store.select(SubCategorySelectors.selectAllSubCategories);
    loading$ = this.store.select(SubCategorySelectors.selectSubCategoryLoading);
    saving$ = this.store.select(SubCategorySelectors.selectSubCategorySaving);
    categories$ = this.store.select(CategorySelectors.selectActiveCategories);

    subCategoryForm = new FormGroup({
        name: new FormControl('', Validators.required),
        category: new FormControl<string | null>(null, Validators.required),
        active: new FormControl(true)
    });

    ngOnInit(): void {
        this.store.dispatch(SubCategoryActions.loadSubCategories({}));
        this.store.dispatch(CategoryActions.loadCategories());

        this.actions$.pipe(ofType(SubCategoryActions.createSubCategorySuccess, SubCategoryActions.updateSubCategorySuccess), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.closeDialog());
    }

    openNew(): void {
        this.isEditMode = false;
        this.currentId = null;
        this.subCategoryForm.reset({ name: '', category: null, active: true });
        this.dialogVisible = true;
    }

    openEdit(subCategory: SubCategory): void {
        this.isEditMode = true;
        this.currentId = subCategory._id ?? null;
        this.subCategoryForm.reset({
            name: subCategory.name,
            category: this.categoryId(subCategory.category),
            active: subCategory.active ?? true
        });
        this.dialogVisible = true;
    }

    closeDialog(): void {
        this.dialogVisible = false;
        this.isEditMode = false;
        this.currentId = null;
    }

    save(): void {
        this.subCategoryForm.markAllAsTouched();
        if (this.subCategoryForm.invalid) return;

        const payload = {
            name: this.subCategoryForm.value.name ?? '',
            category: this.subCategoryForm.value.category ?? undefined,
            active: this.subCategoryForm.value.active ?? true
        };

        if (this.isEditMode && this.currentId) {
            this.store.dispatch(SubCategoryActions.updateSubCategory({ id: this.currentId, payload }));
        } else {
            this.store.dispatch(SubCategoryActions.createSubCategory({ payload }));
        }
    }

    remove(subCategory: SubCategory): void {
        if (!subCategory._id) return;
        this.confirmationService.confirm({
            message: `Supprimer la sous-catégorie "${subCategory.name}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.store.dispatch(SubCategoryActions.deleteSubCategory({ id: subCategory._id as string }))
        });
    }

    // Parent category ref arrives as a populated object or a raw id string.
    categoryName(category: any): string {
        if (!category) return '-';
        if (typeof category === 'string') return '-';
        return category.name ?? '-';
    }

    private categoryId(category: any): string | null {
        if (!category) return null;
        if (typeof category === 'string') return category;
        return typeof category._id === 'string' ? category._id : null;
    }
}
