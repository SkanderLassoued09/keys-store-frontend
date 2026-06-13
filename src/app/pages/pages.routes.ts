import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { Article } from '@/article/article';
import { Employee } from '@/employee/employee';
import { Provider } from '@/provider/provider';
import { Client } from '@/client/client';
import { OrderList } from '@/order-service-list/order-service-list';
import { MachineList } from '@/machine/machine';
import { AdminSettings } from '@/admin-settings/admin-settings';
import { ArticleReturn } from '@/article-return/article-return';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'article', component: Article },
    { path: 'employee', component: Employee },
    { path: 'provider', component: Provider },
    { path: 'client', component: Client },
    { path: 'machine', component: MachineList },
    { path: 'order-service-list', component: OrderList },
    { path: 'article-return', component: ArticleReturn },
    { path: 'admin-settings', component: AdminSettings },
    { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
