import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { CategoryService } from '@/layout/service/category.service';
import * as CategoryActions from './category.actions';

const extractBackendMessage = (error: any, fallback: string): string => error?.error?.message || error?.message || fallback;

export const loadCategories$ = createEffect(
    (actions$ = inject(Actions), categoryService = inject(CategoryService)) =>
        actions$.pipe(
            ofType(CategoryActions.loadCategories),
            mergeMap(() =>
                categoryService.getAll().pipe(
                    map((categories) => CategoryActions.loadCategoriesSuccess({ categories })),
                    catchError((error) => of(CategoryActions.loadCategoriesFailure({ error: extractBackendMessage(error, 'Failed to load categories') })))
                )
            )
        ),
    { functional: true }
);

export const createCategory$ = createEffect(
    (actions$ = inject(Actions), categoryService = inject(CategoryService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(CategoryActions.createCategory),
            mergeMap(({ payload }) =>
                categoryService.create(payload).pipe(
                    map((category) => {
                        messageService.add({ severity: 'success', summary: 'Succès', detail: 'Catégorie créée avec succès', life: 3000 });
                        return CategoryActions.createCategorySuccess({ category });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, "Échec de la création de la catégorie");
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(CategoryActions.createCategoryFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);

export const updateCategory$ = createEffect(
    (actions$ = inject(Actions), categoryService = inject(CategoryService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(CategoryActions.updateCategory),
            mergeMap(({ id, payload }) =>
                categoryService.update(id, payload).pipe(
                    map((category) => {
                        messageService.add({ severity: 'success', summary: 'Succès', detail: 'Catégorie modifiée avec succès', life: 3000 });
                        return CategoryActions.updateCategorySuccess({ category });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, "Échec de la modification de la catégorie");
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(CategoryActions.updateCategoryFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);

export const deleteCategory$ = createEffect(
    (actions$ = inject(Actions), categoryService = inject(CategoryService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(CategoryActions.deleteCategory),
            mergeMap(({ id }) =>
                categoryService.delete(id).pipe(
                    map(() => {
                        messageService.add({ severity: 'success', summary: 'Succès', detail: 'Catégorie supprimée avec succès', life: 3000 });
                        return CategoryActions.deleteCategorySuccess({ id });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, "Échec de la suppression de la catégorie");
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(CategoryActions.deleteCategoryFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);
