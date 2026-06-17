import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { SubCategoryService } from '@/layout/service/sub-category.service';
import * as SubCategoryActions from './sub-category.actions';

const extractBackendMessage = (error: any, fallback: string): string => error?.error?.message || error?.message || fallback;

export const loadSubCategories$ = createEffect(
    (actions$ = inject(Actions), subCategoryService = inject(SubCategoryService)) =>
        actions$.pipe(
            ofType(SubCategoryActions.loadSubCategories),
            mergeMap(({ categoryId }) =>
                subCategoryService.getAll(categoryId).pipe(
                    map((subCategories) => SubCategoryActions.loadSubCategoriesSuccess({ subCategories })),
                    catchError((error) => of(SubCategoryActions.loadSubCategoriesFailure({ error: extractBackendMessage(error, 'Failed to load sub-categories') })))
                )
            )
        ),
    { functional: true }
);

export const createSubCategory$ = createEffect(
    (actions$ = inject(Actions), subCategoryService = inject(SubCategoryService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(SubCategoryActions.createSubCategory),
            mergeMap(({ payload }) =>
                subCategoryService.create(payload).pipe(
                    map((subCategory) => {
                        messageService.add({ severity: 'success', summary: 'Succès', detail: 'Sous-catégorie créée avec succès', life: 3000 });
                        return SubCategoryActions.createSubCategorySuccess({ subCategory });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, "Échec de la création de la sous-catégorie");
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(SubCategoryActions.createSubCategoryFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);

export const updateSubCategory$ = createEffect(
    (actions$ = inject(Actions), subCategoryService = inject(SubCategoryService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(SubCategoryActions.updateSubCategory),
            mergeMap(({ id, payload }) =>
                subCategoryService.update(id, payload).pipe(
                    map((subCategory) => {
                        messageService.add({ severity: 'success', summary: 'Succès', detail: 'Sous-catégorie modifiée avec succès', life: 3000 });
                        return SubCategoryActions.updateSubCategorySuccess({ subCategory });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, "Échec de la modification de la sous-catégorie");
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(SubCategoryActions.updateSubCategoryFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);

export const deleteSubCategory$ = createEffect(
    (actions$ = inject(Actions), subCategoryService = inject(SubCategoryService), messageService = inject(MessageService)) =>
        actions$.pipe(
            ofType(SubCategoryActions.deleteSubCategory),
            mergeMap(({ id }) =>
                subCategoryService.delete(id).pipe(
                    map(() => {
                        messageService.add({ severity: 'success', summary: 'Succès', detail: 'Sous-catégorie supprimée avec succès', life: 3000 });
                        return SubCategoryActions.deleteSubCategorySuccess({ id });
                    }),
                    catchError((error) => {
                        const detail = extractBackendMessage(error, "Échec de la suppression de la sous-catégorie");
                        messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
                        return of(SubCategoryActions.deleteSubCategoryFailure({ error: detail }));
                    })
                )
            )
        ),
    { functional: true }
);
