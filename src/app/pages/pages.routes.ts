import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { Article } from '@/article/article';
import { Employee } from '@/employee/employee';
import { Provider } from '@/provider/provider';
import { Client } from '@/client/client';
import { OrderService } from '@/order-service/order-service';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'article', component: Article },
    { path: 'employee', component: Employee },
    { path: 'provider', component: Provider },
    { path: 'client', component: Client },
    { path: 'order-service', component: OrderService },
    { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
