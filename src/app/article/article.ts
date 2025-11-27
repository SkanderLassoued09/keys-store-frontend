import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ButtonModule, Button } from 'primeng/button';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { RadioButton, RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { Dialog, DialogModule } from 'primeng/dialog';
import { Rating, RatingModule } from 'primeng/rating';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ToolbarModule } from 'primeng/toolbar';
import { Product, ProductService } from '@/pages/service/product.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormControl, FormControlName, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ArticleService } from '@/layout/service/article.service';
import { ProviderService } from '@/layout/service/provider.service';
interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}
export interface Article {
    name?: string;
    reference?: string;
    purchasePrice?: string;
    sellingrice?: string;
    stockQuantity?: number;
    shopQuantity?: number;
    fournisseur?: string;
    type?: string;
    imcategoryage?: string;
}

@Component({
    selector: 'app-article',
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
        RadioButton,
        Rating,
        InputTextModule,
        FormsModule,
        InputNumber,
        IconFieldModule,
        InputIconModule,
        Button,
        ReactiveFormsModule
    ],
    providers: [MessageService, ConfirmationService, ProductService],
    templateUrl: './article.html',
    styleUrl: './article.scss'
})
export class Article {
    cities: any[] | undefined;
    selectedCity: any;
    articleType: any;

    providers: any[] = [];

    articleForm = new FormGroup({
        type: new FormControl('', Validators.required),
        name: new FormControl('', Validators.required),
        reference: new FormControl(''),
        purchasePrice: new FormControl(null, Validators.required),
        sellingrice: new FormControl(null, Validators.required),
        stockQuantity: new FormControl(null),
        shopQuantity: new FormControl(null),
        emplacement: new FormControl(''),
        provider: new FormControl('')
    });

    articleDialog: boolean = false;

    products!: Product[];

    product!: Product;

    selectedProducts!: Article[] | null;

    submitted: boolean = false;

    statuses!: any[];

    @ViewChild('dt') dt!: Table;

    cols!: Column[];

    exportColumns!: ExportColumn[];
    articlesList: any[] = [];

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cd: ChangeDetectorRef,
        private readonly articleService: ArticleService,
        private readonly providerService: ProviderService
    ) {}

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadDemoData();
        this.getAllProvidersToListThemInDropDownList();
        this.getAllArticleForTheTable();
    }
    getValuesFromField() {
        console.log('articleForm', this.articleForm.value);
        this.articleService.createArticle(this.articleForm.value).subscribe({
            next: (response) => {
                console.log('Article created successfully:', response);
                // You can reset your form or show success message
                this.articleForm.reset();
            },
            error: (err) => {
                console.error('Error creating article:', err);
            }
        });
    }

    getAllProvidersToListThemInDropDownList() {
        this.providerService.getAllProviders().subscribe({
            next: (data) => {
                console.log('Providers:', data);
                this.providers = data.map((provider) => {
                    return { id: provider._id, name: provider.name };
                });
            },
            error: (err) => {
                console.error('Error loading providers:', err);
            }
        });
    }

    getAllArticleForTheTable() {
        this.articleService.getAllArticles().subscribe({
            next: (data) => {
                this.articlesList = data;
                console.log('Articles:', data);
            },
            error: (err) => {
                console.error('Error loading articles:', err);
            }
        });
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
        this.articleDialog = true;
    }

    editProduct(product: Product) {
        this.product = { ...product };
        this.articleDialog = true;
    }

    // deleteSelectedProducts() {
    //     this.confirmationService.confirm({
    //         message: 'Are you sure you want to delete the selected products?',
    //         header: 'Confirm',
    //         icon: 'pi pi-exclamation-triangle',
    //         rejectButtonProps: {
    //             label: 'No',
    //             severity: 'secondary',
    //             variant: 'text'
    //         },
    //         acceptButtonProps: {
    //             severity: 'danger',
    //             label: 'Yes'
    //         },
    //         accept: () => {
    //             this.products = this.products.filter((val) => !this.selectedProducts?.includes(val));
    //             this.selectedProducts = null;
    //             this.messageService.add({
    //                 severity: 'success',
    //                 summary: 'Successful',
    //                 detail: 'Products Deleted',
    //                 life: 3000
    //             });
    //         }
    //     });
    // }

    hideDialog() {
        this.articleDialog = false;
        this.submitted = false;
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
            this.articleDialog = false;
            this.product = {};
        }
    }
}
