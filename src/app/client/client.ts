import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as ClientActions from '../store/client-store/client.actions';
import * as ClientSelectors from '../store/client-store/client.selectors';

@Component({
    selector: 'app-client',
    imports: [TableModule, Dialog, ToastModule, ToolbarModule, ConfirmDialog, InputTextModule, CommonModule, FileUpload, FormsModule, IconFieldModule, InputIconModule, Button, ReactiveFormsModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './client.html',
    styleUrl: './client.scss'
})
export class Client {
    // Dialog state
    articleDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    currentClientId: string | null = null;

    // Form
    clientForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        phone: new FormControl('', Validators.required),
        address: new FormControl('', Validators.required)
    });

    // NGRX
    clients$: Observable<any[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;

    constructor(private store: Store) {
        this.clients$ = this.store.select(ClientSelectors.selectAllClients);
        this.loading$ = this.store.select(ClientSelectors.selectClientLoading);
        this.error$ = this.store.select(ClientSelectors.selectClientError);
    }

    ngOnInit() {
        this.store.dispatch(ClientActions.loadClient());
        this.clients$.subscribe((clients) => {
            console.log(clients);
        });
    }

    // Open dialog for creating new client
    openNew() {
        this.isEditMode = false;
        this.currentClientId = null;
        this.clientForm.reset();
        this.submitted = false;
        this.articleDialog = true;
    }

    // Open dialog for editing existing client
    editClient(client: any) {
        this.isEditMode = true;
        this.currentClientId = client._id;

        this.clientForm.patchValue({
            firstName: client.firstName,
            lastName: client.lastName,
            phone: client.phone,
            address: client.address
        });

        this.submitted = false;
        this.articleDialog = true;
    }

    // Save client (handles both create and update)
    onSubmit() {
        this.submitted = true;

        if (this.clientForm.invalid) {
            return;
        }

        if (this.isEditMode && this.currentClientId) {
            // Update existing client
            this.store.dispatch(
                ClientActions.updateClient({
                    client: {
                        id: this.currentClientId,
                        ...this.clientForm.value
                    }
                })
            );
        } else {
            // Create new client
            this.store.dispatch(
                ClientActions.createClient({
                    client: this.clientForm.value
                })
            );
        }

        this.hideDialog();
    }

    // Delete client
    deleteClient(client: any) {
        this.store.dispatch(
            ClientActions.deleteClient({
                id: client._id
            })
        );
    }

    // Hide dialog
    hideDialog() {
        this.articleDialog = false;
        this.submitted = false;
        this.isEditMode = false;
        this.currentClientId = null;
        this.clientForm.reset();
    }

    // Get dialog title dynamically
    getDialogTitle(): string {
        return this.isEditMode ? 'Modifier un client' : 'Créer un client';
    }

    // Get save button label dynamically
    getSaveButtonLabel(): string {
        return this.isEditMode ? 'Enregistrer' : 'Créer le client';
    }

    // Export CSV placeholder
    exportCSV() {
        // Implementation for CSV export if needed
        console.log('Export CSV');
    }
}
