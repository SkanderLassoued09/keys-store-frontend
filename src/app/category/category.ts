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
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { Category } from '@/layout/service/category.service';
import { SubCategory } from '@/layout/service/sub-category.service';
import * as CategoryActions from '../store/category-store/category.actions';
import * as CategorySelectors from '../store/category-store/category.selectors';
import * as SubCategoryActions from '../store/sub-category-store/sub-category.actions';
import * as SubCategorySelectors from '../store/sub-category-store/sub-category.selectors';

// Inline SVG placeholder shown when a category has no image or the URL fails.
export const FALLBACK_IMAGE =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23e5e7eb"/><path d="M20 42l8-10 6 7 5-6 9 9H20z" fill="%239ca3af"/><circle cx="24" cy="24" r="5" fill="%239ca3af"/></svg>';

@Component({
    selector: 'app-category',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, TagModule, ToastModule, ToolbarModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    templateUrl: './category.html',
    styleUrl: './category.scss'
})
export class CategoryPage implements OnInit {
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly destroyRef = inject(DestroyRef);

    readonly fallbackImage = FALLBACK_IMAGE;

    dialogVisible = false;
    isEditMode = false;
    currentId: string | null = null;

    categories$ = this.store.select(CategorySelectors.selectAllCategories);
    loading$ = this.store.select(CategorySelectors.selectCategoryLoading);
    saving$ = this.store.select(CategorySelectors.selectCategorySaving);

    categoryForm = new FormGroup({
        name: new FormControl('', Validators.required),
        image: new FormControl(''),
        active: new FormControl(true)
    });

    // ===== Integrated sub-category management (per category) =====
    allSubCategories: SubCategory[] = [];
    subDialogVisible = false;
    subIsEditMode = false;
    subCurrentId: string | null = null;
    subParentCategoryId: string | null = null;
    subParentCategoryName = '';

    subCategoryForm = new FormGroup({
        name: new FormControl('', Validators.required),
        active: new FormControl(true)
    });

    ngOnInit(): void {
        this.store.dispatch(CategoryActions.loadCategories());
        this.store.dispatch(SubCategoryActions.loadSubCategories({}));

        // Keep a local copy so each category row can list its sub-categories.
        this.store
            .select(SubCategorySelectors.selectAllSubCategories)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((list) => (this.allSubCategories = list));

        // Close the dialog once a create/update succeeds.
        this.actions$.pipe(ofType(CategoryActions.createCategorySuccess, CategoryActions.updateCategorySuccess), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.closeDialog());

        // Close the sub-category dialog when its save succeeds.
        this.actions$.pipe(ofType(SubCategoryActions.createSubCategorySuccess, SubCategoryActions.updateSubCategorySuccess), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.closeSubDialog());
    }

    // Sub-categories belonging to a given category (ref is object or id string).
    subCategoriesFor(categoryId: string | undefined): SubCategory[] {
        if (!categoryId) return [];
        return this.allSubCategories.filter((s) => this.refId(s.category) === categoryId);
    }

    private refId(value: any): string | null {
        if (!value) return null;
        if (typeof value === 'string') return value;
        return typeof value._id === 'string' ? value._id : null;
    }

    // Parent category is auto-assigned from the row — no manual selection.
    openAddSubCategory(category: Category): void {
        this.subIsEditMode = false;
        this.subCurrentId = null;
        this.subParentCategoryId = category._id ?? null;
        this.subParentCategoryName = category.name;
        this.subCategoryForm.reset({ name: '', active: true });
        this.subDialogVisible = true;
    }

    openEditSubCategory(subCategory: SubCategory, category: Category): void {
        this.subIsEditMode = true;
        this.subCurrentId = subCategory._id ?? null;
        this.subParentCategoryId = this.refId(subCategory.category) ?? category._id ?? null;
        this.subParentCategoryName = category.name;
        this.subCategoryForm.reset({ name: subCategory.name, active: subCategory.active ?? true });
        this.subDialogVisible = true;
    }

    closeSubDialog(): void {
        this.subDialogVisible = false;
        this.subIsEditMode = false;
        this.subCurrentId = null;
        this.subParentCategoryId = null;
    }

    saveSubCategory(): void {
        this.subCategoryForm.markAllAsTouched();
        if (this.subCategoryForm.invalid || !this.subParentCategoryId) return;

        const payload = {
            name: this.subCategoryForm.value.name ?? '',
            category: this.subParentCategoryId,
            active: this.subCategoryForm.value.active ?? true
        };

        if (this.subIsEditMode && this.subCurrentId) {
            this.store.dispatch(SubCategoryActions.updateSubCategory({ id: this.subCurrentId, payload }));
        } else {
            this.store.dispatch(SubCategoryActions.createSubCategory({ payload }));
        }
    }

    removeSubCategory(subCategory: SubCategory): void {
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

    openNew(): void {
        this.isEditMode = false;
        this.currentId = null;
        this.categoryForm.reset({ name: '', image: '', active: true });
        this.dialogVisible = true;
    }

    openEdit(category: Category): void {
        this.isEditMode = true;
        this.currentId = category._id ?? null;
        this.categoryForm.reset({
            name: category.name,
            image: category.image ?? '',
            active: category.active ?? true
        });
        this.dialogVisible = true;
    }

    closeDialog(): void {
        this.dialogVisible = false;
        this.isEditMode = false;
        this.currentId = null;
    }

    // Read a chosen file into a base64 data URI stored on the image control,
    // so we support both URL paste and local upload without backend storage.
    onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => this.categoryForm.patchValue({ image: String(reader.result) });
        reader.readAsDataURL(file);
    }

    clearImage(): void {
        this.categoryForm.patchValue({ image: '' });
    }

    save(): void {
        this.categoryForm.markAllAsTouched();
        if (this.categoryForm.invalid) return;

        const payload = {
            name: this.categoryForm.value.name ?? '',
            image: this.categoryForm.value.image ?? '',
            active: this.categoryForm.value.active ?? true
        };

        if (this.isEditMode && this.currentId) {
            this.store.dispatch(CategoryActions.updateCategory({ id: this.currentId, payload }));
        } else {
            this.store.dispatch(CategoryActions.createCategory({ payload }));
        }
    }

    remove(category: Category): void {
        if (!category._id) return;
        this.confirmationService.confirm({
            message: `Supprimer la catégorie "${category.name}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.store.dispatch(CategoryActions.deleteCategory({ id: category._id as string }))
        });
    }

    onImgError(event: Event): void {
        (event.target as HTMLImageElement).src = this.fallbackImage;
    }
}
