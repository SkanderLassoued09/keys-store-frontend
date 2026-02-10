import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as ProviderActions from '../store/provider-store/provider.actions';
import * as ProviderSelectors from '../store/provider-store/provider.selectors';

@Component({
    selector: 'app-provider',
    standalone: true,
    imports: [TableModule, Dialog, SelectModule, ToastModule, ToolbarModule, ConfirmDialog, InputTextModule, TextareaModule, CommonModule, FileUpload, FormsModule, IconFieldModule, InputIconModule, Button, ReactiveFormsModule, DialogModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './provider.html',
    styleUrl: './provider.scss'
})
export class Provider {
    // Dialog state
    providerDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    currentProviderId: string | null = null;

    // Form
    providerForm = new FormGroup({
        name: new FormControl('', Validators.required),
        company: new FormControl(''),
        email: new FormControl('', [Validators.email]),
        phone: new FormControl(''),
        address: new FormControl('')
    });

    // NGRX Observables
    provider$: Observable<any[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;

    constructor(private store: Store) {
        this.provider$ = this.store.select(ProviderSelectors.selectAllProviders);
        this.loading$ = this.store.select(ProviderSelectors.selectProviderLoading);
        this.error$ = this.store.select(ProviderSelectors.selectProviderError);
    }

    ngOnInit() {
        this.store.dispatch(ProviderActions.loadProvider());
    }

    // Open dialog for creating new provider
    openNew() {
        this.isEditMode = false;
        this.currentProviderId = null;
        this.providerForm.reset();
        this.submitted = false;
        this.providerDialog = true;
    }

    // Open dialog for editing existing provider
    editProvider(provider: any) {
        this.isEditMode = true;
        this.currentProviderId = provider._id;

        this.providerForm.patchValue({
            name: provider.name,
            company: provider.company,
            email: provider.email,
            phone: provider.phone,
            address: provider.address
        });

        this.submitted = false;
        this.providerDialog = true;
    }

    // Save provider (handles both create and update)
    saveProvider() {
        this.submitted = true;

        if (this.providerForm.invalid) {
            return;
        }

        if (this.isEditMode && this.currentProviderId) {
            // Update existing provider
            this.store.dispatch(
                ProviderActions.updateProvider({
                    provider: {
                        id: this.currentProviderId,
                        ...this.providerForm.value
                    }
                })
            );
        } else {
            // Create new provider
            this.store.dispatch(
                ProviderActions.createProvider({
                    provider: this.providerForm.value
                })
            );
        }

        this.hideDialog();
    }

    // Delete provider
    deleteProvider(provider: any) {
        this.store.dispatch(
            ProviderActions.deleteProvider({
                id: provider._id
            })
        );
    }

    // Hide dialog
    hideDialog() {
        this.providerDialog = false;
        this.submitted = false;
        this.isEditMode = false;
        this.currentProviderId = null;
        this.providerForm.reset();
    }

    // Get dialog title dynamically
    getDialogTitle(): string {
        return this.isEditMode ? 'Modifier un fournisseur' : 'Créer un fournisseur';
    }

    // Get save button label dynamically
    getSaveButtonLabel(): string {
        return this.isEditMode ? 'Enregistrer' : 'Créer le fournisseur';
    }
}
