import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { RoleService } from '@/layout/service/role.service';
import { errorText, InventoryItemsApi, InventoryOption, OptionType } from './inventory-items.api';

// Add / rename / delete one managed list (emplacements or a category list).
// Renaming updates every item using the name; delete is refused while used.
// Toasts go to the host page's MessageService.
@Component({
    selector: 'app-options-manager',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TagModule],
    template: `
        <form *ngIf="isAdmin" class="flex gap-2 mb-3" (ngSubmit)="add()">
            <input pInputText [(ngModel)]="newName" name="newName" [placeholder]="hint" class="flex-1" aria-label="Nouveau nom" />
            <p-button type="submit" label="Ajouter" icon="pi pi-plus" [disabled]="!newName.trim()" />
        </form>
        <ul class="opt-list">
            <li *ngFor="let o of items">
                <ng-container *ngIf="editingId !== o._id; else editTpl">
                    <span class="flex-1">{{ o.name }}</span>
                    <p-tag [value]="o.usage + ' élément(s)'" [severity]="o.usage ? 'info' : 'secondary'" />
                    <ng-container *ngIf="isAdmin">
                        <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" (onClick)="startEdit(o)" ariaLabel="Renommer" />
                        <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" size="small" (onClick)="remove(o)" [disabled]="o.usage > 0" ariaLabel="Supprimer" [title]="o.usage ? 'Utilisé : réaffectez les éléments avant de supprimer' : 'Supprimer'" />
                    </ng-container>
                </ng-container>
                <ng-template #editTpl>
                    <input pInputText [(ngModel)]="editName" class="flex-1" aria-label="Nouveau nom" (keydown.enter)="saveEdit(o)" (keydown.escape)="editingId = null" />
                    <p-button icon="pi pi-check" [text]="true" [rounded]="true" size="small" (onClick)="saveEdit(o)" ariaLabel="Enregistrer" />
                    <p-button icon="pi pi-times" severity="secondary" [text]="true" [rounded]="true" size="small" (onClick)="editingId = null" ariaLabel="Annuler" />
                </ng-template>
            </li>
            <li *ngIf="!items.length" class="text-surface-500">Aucun élément pour l’instant.</li>
        </ul>
    `,
    styles: `
        .opt-list {
            list-style: none;
            margin: 0;
            padding: 0;
            li {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.45rem 0.25rem;
                border-bottom: 1px solid var(--surface-border);
            }
        }
    `
})
export class OptionsManager implements OnChanges {
    private readonly api = inject(InventoryItemsApi);
    private readonly toast = inject(MessageService);
    readonly isAdmin = inject(RoleService).isAdmin();

    @Input({ required: true }) type!: OptionType;
    @Input() hint = 'Nom';
    @Output() changed = new EventEmitter<InventoryOption[]>();

    items: InventoryOption[] = [];
    newName = '';
    editingId: string | null = null;
    editName = '';

    ngOnChanges(): void {
        this.load();
    }

    load(): void {
        this.api.options(this.type).subscribe({
            next: (r) => {
                this.items = r;
                this.changed.emit(r);
            },
            error: (e) => this.fail(e)
        });
    }

    add(): void {
        const name = this.newName.trim();
        if (!name) return;
        this.api.createOption(this.type, name).subscribe({ next: () => ((this.newName = ''), this.load()), error: (e) => this.fail(e) });
    }

    startEdit(o: InventoryOption): void {
        this.editingId = o._id;
        this.editName = o.name;
    }

    saveEdit(o: InventoryOption): void {
        const name = this.editName.trim();
        if (!name || name === o.name) return void (this.editingId = null);
        this.api.renameOption(o._id, name).subscribe({
            next: () => {
                this.editingId = null;
                this.toast.add({ severity: 'success', summary: 'Renommé', detail: o.usage ? `${o.usage} élément(s) mis à jour` : undefined });
                this.load();
            },
            error: (e) => this.fail(e)
        });
    }

    remove(o: InventoryOption): void {
        this.api.deleteOption(o._id).subscribe({ next: () => this.load(), error: (e) => this.fail(e) });
    }

    private fail(e: any): void {
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: errorText(e) });
    }
}
