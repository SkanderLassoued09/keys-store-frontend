import { ArticleService } from '@/layout/service/article.service';
import { EmployeeService } from '@/layout/service/employee.service';
import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Select, SelectModule } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '@/pages/service/product.service';
import { CommonModule } from '@angular/common';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DateTime } from 'luxon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
    selector: 'app-order-service',
    imports: [TableModule, Dialog, SelectModule, ToastModule, ToolbarModule, InputTextModule, TextareaModule, CommonModule, FormsModule, InputTextModule, FormsModule, InputNumber, IconFieldModule, InputIconModule, Button, ReactiveFormsModule],
    providers: [MessageService, ConfirmationService, ProductService],
    templateUrl: './order.html',
    styleUrl: './order.scss'
})
export class OrderService {
    workServiceForm = new FormGroup({
        employee: new FormControl('', Validators.required),
        quantity: new FormControl(1, Validators.required),
        highlighAboutTheWork: new FormControl('', Validators.required)
    });
    articlesList: any[] = [];
    employeesListForDropDown: any[] = [];
    isModalToSelectEmployeeForTheJobVisible: boolean = false;
    articleSelectedToWorkOnIt: any;
    isModalCreateServiceIndependentOpened: boolean = false;

    constructor(
        private readonly articleService: ArticleService,
        private readonly employeeService: EmployeeService
    ) {}

    ngOnInit() {
        this.getAllArticleForTheTable();
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

    getAllEmployeeToListThemInDropDownInSelectionWhoWillDoTheJob() {
        this.employeeService.getAllEmployees().subscribe({
            next: (data) => {
                this.employeesListForDropDown = ['test', 'test'];
                console.log('employeesListForDropDown:', data);
            },
            error: (err) => {
                console.error('Error loading employees:', err);
            }
        });
    }

    openModalToCreateService() {
        this.isModalCreateServiceIndependentOpened = true;
    }
    onRowClick(data: any) {
        console.log('data', data);
        this.articleSelectedToWorkOnIt = data;
        this.isModalToSelectEmployeeForTheJobVisible = true;
        this.getAllEmployeeToListThemInDropDownInSelectionWhoWillDoTheJob();
    }

    SaveStartTimeWhenTheEmployeeStartWorking() {
        const startTime = DateTime.now().toISO();
        localStorage.setItem('employeeStartedWorkingAt', startTime);
        console.log('startTime', startTime);
    }

    submitOrderService() {
        this.workServiceForm.reset();
        this.isModalToSelectEmployeeForTheJobVisible = false;
        const { employee, quantity, highlighAboutTheWork } = this.workServiceForm.value;
        if (quantity == null || !this.articleSelectedToWorkOnIt || employee == null) {
            console.log('fields in orderService are missing');
            return;
        }
        const startTime: DateTime = DateTime.fromISO(localStorage.getItem('workStartTime')!);
        const endTime: DateTime = DateTime.now();
        let submittedWorkService = {} as any;
        submittedWorkService.price = this.articleSelectedToWorkOnIt.sellingPrice * quantity;
        submittedWorkService.employee = this.articleSelectedToWorkOnIt.employee;
        submittedWorkService.employee = quantity;
        submittedWorkService.highlighAboutTheWork = highlighAboutTheWork;
        submittedWorkService.duration = endTime.diff(startTime, ['hours', 'minutes', 'seconds']).toString();
    }
}
