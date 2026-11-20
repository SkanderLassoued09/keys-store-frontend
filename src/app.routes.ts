import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { OrderService } from '@/order-service/order-service';
import { LoginPage } from '@/auth-login/login';
import { authGuard, shopGuard } from '@/guards/auth.guard';
import { shellChildGuard } from '@/guards/shell-child.guard';

export const appRoutes: Routes = [
    {
        // Owner (admin) shell. `authGuard` requires a login; `canActivateChild`
        // enforces the interface split: employees can only reach the task board
        // here — every other child is owner-only (see shellChildGuard).
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        canActivateChild: [shellChildGuard],
        children: [
            // Home = the real BI dashboard (the Sakai demo stats page was removed).
            { path: '', pathMatch: 'full', redirectTo: 'pages/business-dashboard' },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    // Login (public) + the shared operational Shop (any authenticated user).
    { path: 'login', component: LoginPage },
    { path: 'shop/login', component: LoginPage, data: { shop: true } },
    { path: 'shop', pathMatch: 'full', redirectTo: 'order-service' },
    { path: 'order-service', component: OrderService, canActivate: [shopGuard] },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
