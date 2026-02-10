import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { articleReducer } from '@/store/article-store/article.reducer';
import * as ArticleEffects from '../src/app/store/article-store/article.effects';
import * as ClientEffects from '../src/app/store/client-store/client.effects';
import * as MachineEffects from '../src/app/store/machine-store/machine.effects';
import * as ProviderEffects from '../src/app/store/provider-store/provider.effects';
import * as EmployeeEffects from '../src/app/store/employee-store/employee.effects';
import * as OrderServiceEffects from '../src/app/store/order-service-store/order.service.effects';
import { clientReducer } from '@/store/client-store/client.reducer';
import { employeeReducer } from '@/store/employee-store/employee.reducer';
import { providerReducer } from '@/store/provider-store/provider.reducer';
import { MessageService } from 'primeng/api';
import { orderReducer } from '@/store/order-service-store/order.service.reducer';
import { machineReducer } from '@/store/machine-store/machine.reducer';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync(),
        MessageService,
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        provideStore({ article: articleReducer, client: clientReducer, employee: employeeReducer, provider: providerReducer, order: orderReducer, machine: machineReducer }),
        provideEffects(ArticleEffects, ClientEffects, ProviderEffects, EmployeeEffects, OrderServiceEffects, MachineEffects),
        provideStoreDevtools({ maxAge: 25 })
    ]
};
