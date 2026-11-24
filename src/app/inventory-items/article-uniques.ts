import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { RoleService } from '@/layout/service/role.service';
import { ArticleUnique, errorText, FALLBACK_IMAGE, InventoryItemsApi } from './inventory-items.api';
import { OptionsManager } from './options-manager';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// One-off look-alike items (locks, neimans…): photo first, fields underneath.
@Component({
    selector: 'app-article-uniques',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, ConfirmDialogModule, DialogModule, InputNumberModule, InputTextModule, MultiSelectModule, SelectModule, TagModule, ToastModule, OptionsManager],
    providers: [MessageService, ConfirmationService],
    templateUrl: './article-uniques.html',
    styleUrl: './inventory-items.scss'
})
export class ArticleUniquesPage implements OnInit {
    private readonly api = inject(InventoryItemsApi);
    private readonly toast = inject(MessageService);
    private readonly confirm = inject(ConfirmationService);
    readonly isAdmin = inject(RoleService).isAdmin();
    readonly fallbackImage = FALLBACK_IMAGE;

    items: ArticleUnique[] = [];
    categories: string[] = [];
    locations: string[] = [];
    search = '';
    categoryFilter: string | null = null;
    locationFilter: string | null = null;

    categoriesDialog = false;
    locationsDialog = false;

    dialog = false;
    editingId: string | null = null;
    form = new FormGroup({
        name: new FormControl('', Validators.required),
        category: new FormControl<string | null>(null),
        price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
        emplacements: new FormControl<string[]>([], { nonNullable: true }),
        image: new FormControl('')
    });

    ngOnInit(): void {
        this.reload();
        this.loadOptions();
    }

    reload(): void {
        this.api.uniques().subscribe({ next: (r) => (this.items = r), error: (e) => this.fail(e) });
    }

    loadOptions(): void {
        this.api.options('UNIQUE_CATEGORY').subscribe((r) => (this.categories = r.map((o) => o.name)));
        this.api.options('LOCATION').subscribe((r) => (this.locations = r.map((o) => o.name)));
    }

    get worth(): number {
        return this.filtered.reduce((s, u) => s + (u.price || 0), 0);
    }

    get filtered(): ArticleUnique[] {
        const q = this.search.trim().toLowerCase();
        return this.items.filter(
            (u) =>
                (!this.categoryFilter || u.category === this.categoryFilter) &&
                (!this.locationFilter || u.emplacements?.includes(this.locationFilter)) &&
                (!q || [u.name, u.category, ...(u.emplacements ?? [])].some((v) => v?.toLowerCase().includes(q)))
        );
    }

    // Items grouped by category so the page reads like shelves.
    get groups(): { category: string; items: ArticleUnique[] }[] {
        const map = new Map<string, ArticleUnique[]>();
        for (const u of this.filtered) {
            const key = u.category || 'Sans catégorie';
            map.set(key, [...(map.get(key) ?? []), u]);
        }
        return [...map].map(([category, items]) => ({ category, items }));
    }

    // Options picked in the managers refresh the selects; renames refresh the items too.
    onOptionsChanged(): void {
        this.loadOptions();
        this.reload();
    }

    open(item?: ArticleUnique): void {
        this.editingId = item?._id ?? null;
        this.form.reset({ name: item?.name ?? '', category: item?.category || null, price: item?.price ?? null, emplacements: item?.emplacements ?? [], image: item?.image ?? '' });
        this.dialog = true;
    }

    onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) return this.warn('Choisissez une image.');
        if (file.size > MAX_IMAGE_BYTES) return this.warn('Image trop volumineuse (10 Mo max).');
        const reader = new FileReader();
        reader.onload = () => this.form.patchValue({ image: String(reader.result) });
        reader.readAsDataURL(file);
    }

    save(): void {
        if (this.form.invalid) return this.form.markAllAsTouched();
        const v = this.form.getRawValue();
        this.api.saveUnique(this.editingId, { ...v, category: v.category ?? '' }).subscribe({
            next: () => {
                this.dialog = false;
                this.done(this.editingId ? 'Article unique modifié' : 'Article unique ajouté');
            },
            error: (e) => this.fail(e)
        });
    }

    remove(item: ArticleUnique): void {
        this.confirm.confirm({
            message: `Supprimer « ${item.name} » ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.api.deleteUnique(item._id).subscribe({ next: () => this.done('Article unique supprimé'), error: (e) => this.fail(e) })
        });
    }

    onImgError(event: Event): void {
        (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
    }

    private done(summary: string): void {
        this.toast.add({ severity: 'success', summary });
        this.reload();
    }
    private warn(detail: string): void {
        this.toast.add({ severity: 'warn', summary: 'Attention', detail });
    }
    private fail(e: any): void {
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: errorText(e) });
    }
}
