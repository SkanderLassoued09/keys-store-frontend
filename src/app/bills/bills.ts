import { BillsService } from '@/layout/service/bills.service';
import { EmployeeService } from '@/layout/service/employee.service';
import { ProductService, Product } from '@/pages/service/product.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { FileUpload, UploadEvent } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule, Table } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { API_CONFIG } from 'src/api.config';
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
    selector: 'app-bills',
    imports: [
        TableModule,
        Dialog,
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
        ReactiveFormsModule
    ],
    providers: [MessageService, ConfirmationService, ProductService],
    templateUrl: './bills.html',
    styleUrl: './bills.scss'
})
export class Bills {
    billList: any[] = [];
    isModalToShowBillOpened: boolean = false;
    providers: any[] = [];
    billForm = new FormGroup({
        title: new FormControl('', Validators.required),
        description: new FormControl(''),
        type: new FormControl(null, Validators.required)
    });
    billDialog: boolean = false;

    products!: Product[];

    product!: Product;

    selectedProducts!: Product[] | null;

    submitted: boolean = false;

    statuses!: any[];

    @ViewChild('dt') dt!: Table;

    cols!: Column[];

    exportColumns!: ExportColumn[];
    billUploaded: any;
    billById: any;

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private readonly billsService: BillsService,
        private cd: ChangeDetectorRef
    ) {}

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadDemoData();
        this.getAllBillsForTheTable();
    }

    loadDemoData() {
        this.productService.getProducts().then((data) => {
            this.products = data;
            this.cd.markForCheck();
        });

        this.statuses = [
            { label: 'INSTOCK', value: 'instock' },
            { label: 'LOWSTOCK', value: 'lowstock' },
            { label: 'OUTOFSTOCK', value: 'outofstock' }
        ];

        this.cols = [
            { field: 'code', header: 'Code', customExportHeader: 'Product Code' },
            { field: 'name', header: 'Name' },
            { field: 'image', header: 'Image' },
            { field: 'price', header: 'Price' },
            { field: 'category', header: 'Category' }
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    openNew() {
        this.product = {};
        this.submitted = false;
        this.billDialog = true;
    }

    editProduct(product: Product) {
        this.product = { ...product };
        this.billDialog = true;
    }

    deleteSelectedProducts() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected products?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                variant: 'text'
            },
            acceptButtonProps: {
                severity: 'danger',
                label: 'Yes'
            },
            accept: () => {
                this.products = this.products.filter((val) => !this.selectedProducts?.includes(val));
                this.selectedProducts = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Products Deleted',
                    life: 3000
                });
            }
        });
    }

    getBillById(_idBill: any) {
        this.billsService.getBillById(_idBill).subscribe({
            next: (data) => {
                console.log(data);
                return data;
            },
            error: (err) => {
                console.error('Error loading bill:', err);
                return null;
            }
        });
    }

    onRowClick(data: any) {
        console.log(data);

        // Construct full URL
        const fileUrl = `${API_CONFIG.baseUrl}/files/${data.file}`;
        console.log(fileUrl);

        window.open(fileUrl, '_blank');
    }

    addNewBill() {
        const formData = new FormData();

        // form fields
        Object.entries(this.billForm.value).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value as any);
            }
        });

        // file
        if (this.billUploaded) {
            formData.append('file', this.billUploaded);
        }

        this.billsService.createBill(formData).subscribe({
            next: () => {
                this.billForm.reset();
                this.billUploaded = undefined!;
            },
            error: (err) => console.error(err)
        });
    }

    getAllBillsForTheTable() {
        this.billsService.getAllBills().subscribe({
            next: (data) => {
                this.billList = data;
                console.log('bill:', data);
            },
            error: (err) => {
                console.error('Error loading bill:', err);
            }
        });
    }

    hideDialog() {
        this.billDialog = false;
        this.submitted = false;
    }

    onUpload(event: any) {
        console.log(event);
        const file = event.files[0];
        if (!file) return;

        this.billUploaded = file; // ✅ store File object
        console.log('billUploaded', this.billUploaded);
    }

    deleteProduct(product: Product) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + product.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                variant: 'text'
            },
            acceptButtonProps: {
                severity: 'danger',
                label: 'Yes'
            },
            accept: () => {
                this.products = this.products.filter((val) => val.id !== product.id);
                this.product = {};
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Deleted',
                    life: 3000
                });
            }
        });
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.products.length; i++) {
            if (this.products[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    createId(): string {
        let id = '';
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    // getSeverity(status: string) {
    //     switch (status) {
    //         case 'INSTOCK':
    //             return 'success';
    //         case 'LOWSTOCK':
    //             return 'warn';
    //         case 'OUTOFSTOCK':
    //             return 'danger';
    //     }
    // }

    saveProduct() {
        this.submitted = true;

        if (this.product.name?.trim()) {
            if (this.product.id) {
                this.products[this.findIndexById(this.product.id)] = this.product;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Updated',
                    life: 3000
                });
            } else {
                this.product.id = this.createId();
                this.product.image = 'product-placeholder.svg';
                this.products.push(this.product);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Created',
                    life: 3000
                });
            }

            this.products = [...this.products];
            this.billDialog = false;
            this.product = {};
        }
    }
}
