import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { RoleService } from '@/layout/service/role.service';
import { API_CONFIG } from 'src/api.config';

export interface ArticleUnique {
    _id: string;
    name: string;
    category?: string;
    image?: string;
    price: number;
    emplacements: string[];
}

export type SupplyStatus = 'INVENTORY' | 'SHOP';
export interface ShopSupply {
    _id: string;
    name: string;
    category?: string;
    price: number;
    emplacements: string[];
    quantity: number;
    status: SupplyStatus;
}

interface Worth {
    uniques: { value: number; count: number };
    supplies: { inventory: { value: number; quantity: number }; shop: { value: number; quantity: number }; value: number };
    total: number;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const FALLBACK_IMAGE =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23e5e7eb"/><path d="M20 42l8-10 6 7 5-6 9 9H20z" fill="%239ca3af"/><circle cx="24" cy="24" r="5" fill="%239ca3af"/></svg>';

// Unique look-alike items + workshop supplies. Lives only in the inventory
// interface (never in the POS). Plain HttpClient: two small CRUD lists don't
// need an NgRx slice.
@Component({
    selector: 'app-inventory-items',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, ConfirmDialogModule, DialogModule, InputNumberModule, InputTextModule, SelectButtonModule, TableModule, TabsModule, TagModule, ToastModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './inventory-items.html',
    styleUrl: './inventory-items.scss'
})
export class InventoryItems implements OnInit {
    private readonly http = inject(HttpClient);
    private readonly toast = inject(MessageService);
    private readonly confirm = inject(ConfirmationService);
    readonly isAdmin = inject(RoleService).isAdmin();
    private readonly api = API_CONFIG.baseUrl;
    readonly fallbackImage = FALLBACK_IMAGE;

    tab = 'uniques';
    uniques: ArticleUnique[] = [];
    supplies: ShopSupply[] = [];
    worth: Worth | null = null;

    uniqueSearch = '';
    supplyFilter: 'ALL' | SupplyStatus = 'ALL';
    readonly statusOptions = [
        { label: 'Tous', value: 'ALL' },
        { label: 'Inventaire', value: 'INVENTORY' },
        { label: 'Boutique', value: 'SHOP' }
    ];
    readonly supplyStatusOptions = this.statusOptions.slice(1);

    // ----- dialogs -----
    uniqueDialog = false;
    editingUniqueId: string | null = null;
    uniqueForm = new FormGroup({
        name: new FormControl('', Validators.required),
        category: new FormControl(''),
        price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
        emplacements: new FormControl(''),
        image: new FormControl('')
    });

    supplyDialog = false;
    editingSupplyId: string | null = null;
    supplyForm = new FormGroup({
        name: new FormControl('', Validators.required),
        category: new FormControl(''),
        price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
        quantity: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
        status: new FormControl<SupplyStatus>('INVENTORY', Validators.required),
        emplacements: new FormControl('')
    });

    moveDialog = false;
    moving: ShopSupply | null = null;
    moveQuantity = 1;

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        this.http.get<ArticleUnique[]>(`${this.api}/article-unique`).subscribe({ next: (r) => (this.uniques = r), error: (e) => this.fail(e) });
        this.http.get<ShopSupply[]>(`${this.api}/shop-supply`).subscribe({ next: (r) => (this.supplies = r), error: (e) => this.fail(e) });
        this.http.get<Worth>(`${this.api}/shop-supply/worth`).subscribe({ next: (r) => (this.worth = r), error: (e) => this.fail(e) });
    }

    // ----- lists -----
    get filteredUniques(): ArticleUnique[] {
        const q = this.uniqueSearch.trim().toLowerCase();
        if (!q) return this.uniques;
        return this.uniques.filter((u) => [u.name, u.category, ...(u.emplacements ?? [])].some((v) => v?.toLowerCase().includes(q)));
    }

    get filteredSupplies(): ShopSupply[] {
        return this.supplyFilter === 'ALL' ? this.supplies : this.supplies.filter((s) => s.status === this.supplyFilter);
    }

    // Existing categories, offered through a native <datalist>.
    get uniqueCategories(): string[] {
        return [...new Set(this.uniques.map((u) => u.category).filter((c): c is string => !!c))].sort();
    }
    get supplyCategories(): string[] {
        return [...new Set(this.supplies.map((s) => s.category).filter((c): c is string => !!c))].sort();
    }

    statusLabel(s: SupplyStatus): string {
        return s === 'SHOP' ? 'Boutique' : 'Inventaire';
    }

    // ----- ArticleUnique -----
    openUnique(item?: ArticleUnique): void {
        this.editingUniqueId = item?._id ?? null;
        this.uniqueForm.reset({ name: item?.name ?? '', category: item?.category ?? '', price: item?.price ?? null, emplacements: (item?.emplacements ?? []).join(', '), image: item?.image ?? '' });
        this.uniqueDialog = true;
    }

    onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return this.warn('Choisissez une image.');
        if (file.size > MAX_IMAGE_BYTES) return this.warn('Image trop volumineuse (10 Mo max).');
        const reader = new FileReader();
        reader.onload = () => this.uniqueForm.patchValue({ image: String(reader.result) });
        reader.readAsDataURL(file);
        input.value = '';
    }

    saveUnique(): void {
        if (this.uniqueForm.invalid) return this.uniqueForm.markAllAsTouched();
        const body = this.uniqueForm.getRawValue();
        const req = this.editingUniqueId ? this.http.put(`${this.api}/article-unique/${this.editingUniqueId}`, body) : this.http.post(`${this.api}/article-unique`, body);
        req.subscribe({
            next: () => {
                this.uniqueDialog = false;
                this.done(this.editingUniqueId ? 'Article unique modifié' : 'Article unique ajouté');
            },
            error: (e) => this.fail(e)
        });
    }

    deleteUnique(item: ArticleUnique): void {
        this.confirm.confirm({
            message: `Supprimer « ${item.name} » ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.http.delete(`${this.api}/article-unique/${item._id}`).subscribe({ next: () => this.done('Article unique supprimé'), error: (e) => this.fail(e) })
        });
    }

    // ----- ShopSupply -----
    openSupply(item?: ShopSupply): void {
        this.editingSupplyId = item?._id ?? null;
        this.supplyForm.reset({ name: item?.name ?? '', category: item?.category ?? '', price: item?.price ?? null, quantity: item?.quantity ?? 0, status: item?.status ?? 'INVENTORY', emplacements: (item?.emplacements ?? []).join(', ') });
        this.supplyDialog = true;
    }

    saveSupply(): void {
        if (this.supplyForm.invalid) return this.supplyForm.markAllAsTouched();
        const body = this.supplyForm.getRawValue();
        const req = this.editingSupplyId ? this.http.put(`${this.api}/shop-supply/${this.editingSupplyId}`, body) : this.http.post(`${this.api}/shop-supply`, body);
        req.subscribe({
            next: () => {
                this.supplyDialog = false;
                this.done(this.editingSupplyId ? 'Fourniture modifiée' : 'Fourniture ajoutée');
            },
            error: (e) => this.fail(e)
        });
    }

    deleteSupply(item: ShopSupply): void {
        this.confirm.confirm({
            message: `Supprimer « ${item.name} » (${this.statusLabel(item.status)}) ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.http.delete(`${this.api}/shop-supply/${item._id}`).subscribe({ next: () => this.done('Fourniture supprimée'), error: (e) => this.fail(e) })
        });
    }

    adjust(item: ShopSupply, delta: number): void {
        this.http.patch(`${this.api}/shop-supply/${item._id}/adjust`, { delta }).subscribe({ next: () => this.reload(), error: (e) => this.fail(e) });
    }

    openMove(item: ShopSupply): void {
        this.moving = item;
        this.moveQuantity = item.quantity;
        this.moveDialog = true;
    }

    confirmMove(): void {
        const item = this.moving;
        if (!item || !(this.moveQuantity >= 1 && this.moveQuantity <= item.quantity)) return this.warn('Quantité invalide.');
        this.http.patch(`${this.api}/shop-supply/${item._id}/move`, { quantity: this.moveQuantity }).subscribe({
            next: () => {
                this.moveDialog = false;
                this.done(`${this.moveQuantity} × ${item.name} → ${this.statusLabel(item.status === 'SHOP' ? 'INVENTORY' : 'SHOP')}`);
            },
            error: (e) => this.fail(e)
        });
    }

    // ----- helpers -----
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
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: e?.error?.message || e?.message || 'Opération échouée' });
    }
}
