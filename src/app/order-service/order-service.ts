import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-order-service',
    imports: [TableModule],
    templateUrl: './order-service.html',
    styleUrl: './order-service.scss'
})
export class OrderService {}
