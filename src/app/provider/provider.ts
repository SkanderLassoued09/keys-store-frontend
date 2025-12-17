import { ProviderService } from '@/layout/service/provider.service';
import { Product, ProductService } from '@/pages/service/product.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { Rating } from 'primeng/rating';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-provider',
    imports: [
        TableModule,
        SelectModule,
        ToastModule,
        ToolbarModule,
        ConfirmDialog,
        InputTextModule,
        TextareaModule,
        CommonModule,
        FileUpload,
        FormsModule,
        InputTextModule,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        Button,
        ReactiveFormsModule,
        Dialog
    ],
    providers: [MessageService, ConfirmationService, ProductService],
    templateUrl: './provider.html',
    styleUrl: './provider.scss'
})
export class Provider {
    providersList: any[] = [];
    onSubmit() {
        throw new Error('Method not implemented.');
    }
    providers: any[] = [];
    providerFrom = new FormGroup({
        name: new FormControl('', Validators.required),
        email: new FormControl(''),
        company: new FormControl(''),
        address: new FormControl(''),
        phone: new FormControl('')
    });
    providerDialog: boolean = false;

    products!: Product[];

    product!: Product;

    selectedProducts!: Product[] | null;

    submitted: boolean = false;

    statuses!: any[];

    @ViewChild('dt') dt!: Table;

    cols!: Column[];

    exportColumns!: ExportColumn[];

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private readonly providerService: ProviderService,
        private confirmationService: ConfirmationService,
        private cd: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.getAllProvidersForTheTable();
    }

    getAllProvidersForTheTable() {
        this.providerService.getAllProviders().subscribe({
            next: (data) => {
                this.providersList = data;
                console.log('Articles:', data);
            },
            error: (err) => {
                console.error('Error loading articles:', err);
            }
        });
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    openNew() {
        this.product = {};
        this.submitted = false;
        this.providerDialog = true;
    }

    hideDialog() {
        this.providerDialog = false;
        this.submitted = false;
    }

    saveNewProvider() {
        console.log('articleForm', this.providerFrom.value);
        this.providerService.createProvider(this.providerFrom.value).subscribe({
            next: (response) => {
                console.log('Article created successfully:', response);
                // You can reset your form or show success message
                this.providerFrom.reset();
                this.providerDialog = false;
            },
            error: (err) => {
                console.error('Error creating article:', err);
            }
        });
    }
}
