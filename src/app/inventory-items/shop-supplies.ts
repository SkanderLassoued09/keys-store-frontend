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
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { RoleService } from '@/layout/service/role.service';
import { errorText, InventoryItemsApi, ShopSupply, SupplyStatus, Worth } from './inventory-items.api';
import { OptionsManager } from './options-manager';

// Workshop consumables (mèches…): one row per location, moves between
// inventory and shop, +/- quantity, worth = price × quantity.
@Component({
    selector: 'app-shop-supplies',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, ConfirmDialogModule, DialogModule, InputNumberModule, InputTextModule, MultiSelectModule, SelectModule, SelectButtonModule, TableModule, TagModule, ToastModule, OptionsManager],
    providers: [MessageService, ConfirmationService],
    templateUrl: './shop-supplies.html',
    styleUrl: './inventory-items.scss'
})
export class ShopSuppliesPage implements OnInit {
    private readonly api = inject(InventoryItemsApi);
    private readonly toast = inject(MessageService);
    private readonly confirm = inject(ConfirmationService);
    readonly isAdmin = inject(RoleService).isAdmin();

    supplies: ShopSupply[] = [];
    worth: Worth | null = null;
    categories: string[] = [];
    locations: string[] = [];

    search = '';
    statusFilter: 'ALL' | SupplyStatus = 'ALL';
    categoryFilter: string | null = null;
    locationFilter: string | null = null;
    readonly statusOptions = [
        { label: 'Tous', value: 'ALL' },
        { label: 'Inventaire', value: 'INVENTORY' },
        { label: 'Boutique', value: 'SHOP' }
    ];
    readonly formStatusOptions = this.statusOptions.slice(1);

    categoriesDialog = false;
    locationsDialog = false;

    dialog = false;
    editingId: string | null = null;
    form = new FormGroup({
        name: new FormControl('', Validators.required),
        category: new FormControl<string | null>(null),
        price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
        quantity: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
        status: new FormControl<SupplyStatus>('INVENTORY', { nonNullable: true }),
        emplacements: new FormControl<string[]>([], { nonNullable: true })
    });

    moveDialog = false;
    moving: ShopSupply | null = null;
    moveQuantity = 1;

    ngOnInit(): void {
        this.reload();
        this.loadOptions();
    }

    reload(): void {
        this.api.supplies().subscribe({ next: (r) => (this.supplies = r), error: (e) => this.fail(e) });
        this.api.worth().subscribe({ next: (r) => (this.worth = r), error: (e) => this.fail(e) });
    }

    loadOptions(): void {
        this.api.options('SUPPLY_CATEGORY').subscribe((r) => (this.categories = r.map((o) => o.name)));
        this.api.options('LOCATION').subscribe((r) => (this.locations = r.map((o) => o.name)));
    }

    onOptionsChanged(): void {
        this.loadOptions();
        this.reload();
    }

    get filtered(): ShopSupply[] {
        const q = this.search.trim().toLowerCase();
        return this.supplies.filter(
            (s) =>
                (this.statusFilter === 'ALL' || s.status === this.statusFilter) &&
                (!this.categoryFilter || s.category === this.categoryFilter) &&
                (!this.locationFilter || s.emplacements?.includes(this.locationFilter)) &&
                (!q || [s.name, s.category, ...(s.emplacements ?? [])].some((v) => v?.toLowerCase().includes(q)))
        );
    }

    get filteredWorth(): number {
        return this.filtered.reduce((sum, s) => sum + (s.price || 0) * (s.quantity || 0), 0);
    }

    statusLabel(s: SupplyStatus): string {
        return s === 'SHOP' ? 'Boutique' : 'Inventaire';
    }

    open(item?: ShopSupply): void {
        this.editingId = item?._id ?? null;
        this.form.reset({
            name: item?.name ?? '',
            category: item?.category || null,
            price: item?.price ?? null,
            quantity: item?.quantity ?? 0,
            status: item?.status ?? 'INVENTORY',
            emplacements: item?.emplacements ?? []
        });
        this.dialog = true;
    }

    save(): void {
        if (this.form.invalid) return this.form.markAllAsTouched();
        const v = this.form.getRawValue();
        this.api.saveSupply(this.editingId, { ...v, category: v.category ?? '' }).subscribe({
            next: () => {
                this.dialog = false;
                this.done(this.editingId ? 'Fourniture modifiée' : 'Fourniture ajoutée');
            },
            error: (e) => this.fail(e)
        });
    }

    remove(item: ShopSupply): void {
        this.confirm.confirm({
            message: `Supprimer « ${item.name} » (${this.statusLabel(item.status)}) ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.api.deleteSupply(item._id).subscribe({ next: () => this.done('Fourniture supprimée'), error: (e) => this.fail(e) })
        });
    }

    adjust(item: ShopSupply, delta: number): void {
        this.api.adjustSupply(item._id, delta).subscribe({ next: () => this.reload(), error: (e) => this.fail(e) });
    }

    openMove(item: ShopSupply): void {
        this.moving = item;
        this.moveQuantity = item.quantity;
        this.moveDialog = true;
    }

    confirmMove(): void {
        const item = this.moving;
        if (!item || !(this.moveQuantity >= 1 && this.moveQuantity <= item.quantity)) return this.warn('Quantité invalide.');
        this.api.moveSupply(item._id, this.moveQuantity).subscribe({
            next: () => {
                this.moveDialog = false;
                this.done(`${this.moveQuantity} × ${item.name} → ${this.statusLabel(item.status === 'SHOP' ? 'INVENTORY' : 'SHOP')}`);
            },
            error: (e) => this.fail(e)
        });
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
