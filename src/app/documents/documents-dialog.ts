import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { API_CONFIG } from 'src/api.config';

export type DocumentType = 'BL' | 'BC' | 'FACTURE';

export interface TrackedDocument {
    _id: string;
    type: DocumentType;
    number?: string;
    date?: string;
    amount?: number;
    notes?: string;
    fileName?: string;
    fileData?: string;
    hasFile?: boolean;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;

// BL / BC / invoice tracking for one client or one supplier. This is the only
// feature clients and suppliers have (no link to articles or sales).
@Component({
    selector: 'app-documents-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, DatePickerModule, DialogModule, InputNumberModule, InputTextModule, SelectModule, TableModule, TagModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast />
        <p-dialog [visible]="visible" (visibleChange)="visibleChange.emit($event)" [modal]="true" [style]="{ width: '95vw', maxWidth: '1000px' }" [header]="'Documents — ' + ownerName">
            <form [formGroup]="form" class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4" (ngSubmit)="save()">
                <div class="flex flex-col gap-1">
                    <label>Type <span class="text-red-500">*</span></label>
                    <p-select formControlName="type" [options]="typeOptions" optionLabel="label" optionValue="value" appendTo="body" class="w-full" />
                </div>
                <div class="flex flex-col gap-1">
                    <label>N°</label>
                    <input pInputText formControlName="number" placeholder="Ex: FA-012" />
                </div>
                <div class="flex flex-col gap-1">
                    <label>Date</label>
                    <p-datepicker formControlName="date" dateFormat="dd/mm/yy" appendTo="body" styleClass="w-full" />
                </div>
                <div class="flex flex-col gap-1">
                    <label>Montant (TND)</label>
                    <p-inputNumber formControlName="amount" [min]="0" [minFractionDigits]="0" [maxFractionDigits]="3" styleClass="w-full" inputStyleClass="w-full" />
                </div>
                <div class="flex flex-col gap-1 md:col-span-2">
                    <label>Fichier (PDF / image, 10 Mo max)</label>
                    <input #fileInput type="file" accept="application/pdf,image/*" (change)="onFile($event)" />
                </div>
                <div class="flex flex-col gap-1 md:col-span-2">
                    <label>Notes</label>
                    <input pInputText formControlName="notes" />
                </div>
                <p-button class="md:col-start-4 justify-self-end" type="submit" label="Ajouter" icon="pi pi-plus" [loading]="saving" [disabled]="form.invalid || saving" />
            </form>

            <p-table [value]="documents" [loading]="loading" [rows]="10" [paginator]="documents.length > 10" dataKey="_id">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Type</th>
                        <th>N°</th>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Notes</th>
                        <th style="width: 9rem">Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-doc>
                    <tr>
                        <td><p-tag [value]="typeLabel(doc.type)" [severity]="doc.type === 'FACTURE' ? 'success' : doc.type === 'BL' ? 'info' : 'warn'" /></td>
                        <td>{{ doc.number || '-' }}</td>
                        <td>{{ doc.date ? (doc.date | date: 'dd/MM/yyyy') : '-' }}</td>
                        <td>{{ doc.amount != null ? (doc.amount | number: '1.3-3') + ' TND' : '-' }}</td>
                        <td>{{ doc.notes || '-' }}</td>
                        <td>
                            <p-button *ngIf="doc.hasFile" icon="pi pi-download" [text]="true" [rounded]="true" (click)="download(doc)" [attr.title]="doc.fileName || 'Télécharger'" />
                            <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (click)="remove(doc)" title="Supprimer" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center">Aucun document.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-dialog>
    `
})
export class DocumentsDialog implements OnChanges {
    private readonly http = inject(HttpClient);
    private readonly messages = inject(MessageService);
    private readonly baseUrl = `${API_CONFIG.baseUrl}/document`;

    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Input() ownerType: 'client' | 'provider' = 'client';
    @Input() ownerId: string | null = null;
    @Input() ownerName = '';
    @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

    readonly typeOptions = [
        { label: 'Facture', value: 'FACTURE' },
        { label: 'Bon de livraison (BL)', value: 'BL' },
        { label: 'Bon de commande (BC)', value: 'BC' }
    ];

    documents: TrackedDocument[] = [];
    loading = false;
    saving = false;
    private file: { name: string; data: string } | null = null;

    form = new FormGroup({
        type: new FormControl<DocumentType>('FACTURE', { nonNullable: true, validators: Validators.required }),
        number: new FormControl(''),
        date: new FormControl<Date | null>(new Date()),
        amount: new FormControl<number | null>(null),
        notes: new FormControl('')
    });

    ngOnChanges(): void {
        if (this.visible && this.ownerId) this.load();
    }

    typeLabel(type: DocumentType): string {
        return type === 'FACTURE' ? 'Facture' : type;
    }

    load(): void {
        this.loading = true;
        this.http.get<TrackedDocument[]>(this.baseUrl, { params: { [this.ownerType]: this.ownerId! } }).subscribe({
            next: (docs) => {
                this.documents = docs;
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                this.toastError(err);
            }
        });
    }

    onFile(event: Event): void {
        const input = event.target as HTMLInputElement;
        const picked = input.files?.[0];
        this.file = null;
        if (!picked) return;
        if (picked.size > MAX_FILE_BYTES) {
            input.value = '';
            this.messages.add({ severity: 'warn', summary: 'Fichier trop volumineux', detail: '10 Mo maximum.' });
            return;
        }
        const reader = new FileReader();
        reader.onload = () => (this.file = { name: picked.name, data: String(reader.result) });
        reader.readAsDataURL(picked);
    }

    save(): void {
        if (this.form.invalid || !this.ownerId) return;
        const v = this.form.getRawValue();
        this.saving = true;
        this.http
            .post(this.baseUrl, {
                type: v.type,
                number: v.number || undefined,
                date: v.date ? v.date.toISOString() : undefined,
                amount: v.amount ?? undefined,
                notes: v.notes || undefined,
                [this.ownerType]: this.ownerId,
                fileName: this.file?.name,
                fileData: this.file?.data
            })
            .subscribe({
                next: () => {
                    this.saving = false;
                    this.file = null;
                    this.form.reset({ type: 'FACTURE', number: '', date: new Date(), amount: null, notes: '' });
                    if (this.fileInput) this.fileInput.nativeElement.value = '';
                    this.messages.add({ severity: 'success', summary: 'Document ajouté' });
                    this.load();
                },
                error: (err) => {
                    this.saving = false;
                    this.toastError(err);
                }
            });
    }

    download(doc: TrackedDocument): void {
        this.http.get<TrackedDocument>(`${this.baseUrl}/${doc._id}`).subscribe({
            next: (full) => {
                if (!full.fileData) return;
                const a = document.createElement('a');
                a.href = full.fileData;
                a.download = full.fileName || `${full.type}-${full.number || full._id}`;
                a.click();
            },
            error: (err) => this.toastError(err)
        });
    }

    remove(doc: TrackedDocument): void {
        if (!confirm(`Supprimer ce document (${this.typeLabel(doc.type)} ${doc.number || ''}) ?`)) return;
        this.http.delete(`${this.baseUrl}/${doc._id}`).subscribe({
            next: () => this.load(),
            error: (err) => this.toastError(err)
        });
    }

    private toastError(err: any): void {
        this.messages.add({ severity: 'error', summary: 'Erreur', detail: err?.error?.message || err?.message || 'Erreur serveur' });
    }
}
