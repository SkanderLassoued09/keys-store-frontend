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
import { ArticleReturn } from '@/article-return/article-return';
import { CategoryPage } from '@/category/category';
import { SubCategoryPage } from '@/sub-category/sub-category';
import { EmployeeLedgerPage } from '@/employee-ledger/employee-ledger';
import { WorkTaskPage } from '@/work-task/work-task';
import { EmployeeDashboard } from '@/employee-dashboard/employee-dashboard';
import { adminGuard } from '@/guards/admin.guard';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'article', component: Article },
    { path: 'employee', component: Employee },
    { path: 'provider', component: Provider },
    { path: 'client', component: Client },
    { path: 'machine', component: MachineList },
    { path: 'order-service-list', component: OrderList, canActivate: [adminGuard] },
    { path: 'article-return', component: ArticleReturn },
    { path: 'category', component: CategoryPage },
    { path: 'sub-category', component: SubCategoryPage },
    { path: 'employee-dashboard', component: EmployeeDashboard, canActivate: [adminGuard] },
    { path: 'employee-ledger', component: EmployeeLedgerPage },
    { path: 'work-task', component: WorkTaskPage },
    { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
