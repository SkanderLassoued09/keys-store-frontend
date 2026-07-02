import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { OrderService } from '@/order-service/order-service';
import { LoginPage } from '@/auth-login/login';
import { authGuard } from '@/guards/auth.guard';
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
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    // Login (public) + the shared operational Shop (any authenticated user).
    { path: 'login', component: LoginPage },
    { path: 'order-service', component: OrderService, canActivate: [authGuard] },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
