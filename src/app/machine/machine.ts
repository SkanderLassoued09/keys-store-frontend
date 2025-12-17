import { MachineService } from '@/layout/service/machine.service';
import { ProductService } from '@/pages/service/product.service';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
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
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { Toolbar, ToolbarModule } from 'primeng/toolbar';

@Component({
    selector: 'app-machine',
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
    templateUrl: './machine.html',
    styleUrl: './machine.scss'
})
export class Machine {
    @ViewChild('dt') dt!: Table;
    machineForm = new FormGroup({
        name: new FormControl('', Validators.required),
        type: new FormControl(''),
        serialNumber: new FormControl(null, Validators.required)
    });
    machineList: any[] = [];
    machineDialog: boolean = false;
    constructor(private readonly machineService: MachineService) {}

    ngOnInit() {
        this.getAllEmployeeForTheTable();
    }
    exportCSV() {
        this.dt.exportCSV();
    }

    openNew() {
        // this.product = {};
        // this.submitted = false;
        this.machineDialog = true;
    }

    addNewMachine() {
        console.log('articleForm', this.machineForm.value);
        this.machineService.createMachine(this.machineForm.value).subscribe({
            next: (response) => {
                console.log('Article created successfully:', response);
                // You can reset your form or show success message
                this.machineForm.reset();
            },
            error: (err) => {
                console.error('Error creating article:', err);
            }
        });
    }
    hideDialog() {
        this.machineDialog = false;
        // this.submitted = false;
    }

    getAllEmployeeForTheTable() {
        this.machineService.getAllMachines().subscribe({
            next: (data) => {
                this.machineList = data;
                console.log('machine:', data);
            },
            error: (err) => {
                console.error('Error loading machine:', err);
            }
        });
    }
}
