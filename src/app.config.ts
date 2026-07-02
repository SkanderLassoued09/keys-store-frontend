import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, isDevMode } from '@angular/core';
import { authInterceptor } from '@/core/auth.interceptor';
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
import * as StockTransferEffects from '../src/app/store/stock-transfer-store/stock-transfer.effects';
import * as SettingsEffects from '../src/app/store/settings-store/settings.effects';
import * as ArticleReturnEffects from '../src/app/store/article-return-store/article-return.effects';
import * as CategoryEffects from '../src/app/store/category-store/category.effects';
import * as SubCategoryEffects from '../src/app/store/sub-category-store/sub-category.effects';
import * as EmployeeLedgerEffects from '../src/app/store/employee-ledger-store/employee-ledger.effects';
import * as WorkTaskEffects from '../src/app/store/work-task-store/work-task.effects';
import * as EmployeeDashboardEffects from '../src/app/store/employee-dashboard-store/employee-dashboard.effects';
import * as BusinessDashboardEffects from '../src/app/store/business-dashboard-store/business-dashboard.effects';
import { clientReducer } from '@/store/client-store/client.reducer';
import { employeeReducer } from '@/store/employee-store/employee.reducer';
import { providerReducer } from '@/store/provider-store/provider.reducer';
import { MessageService } from 'primeng/api';
import { orderReducer } from '@/store/order-service-store/order.service.reducer';
import { machineReducer } from '@/store/machine-store/machine.reducer';
import { stockTransferReducer } from '@/store/stock-transfer-store/stock-transfer.reducer';
import { settingsReducer } from '@/store/settings-store/settings.reducer';
import { articleReturnReducer } from '@/store/article-return-store/article-return.reducer';
import { categoryReducer } from '@/store/category-store/category.reducer';
import { subCategoryReducer } from '@/store/sub-category-store/sub-category.reducer';
import { employeeLedgerReducer } from '@/store/employee-ledger-store/employee-ledger.reducer';
import { workTaskReducer } from '@/store/work-task-store/work-task.reducer';
import { employeeDashboardReducer } from '@/store/employee-dashboard-store/employee-dashboard.reducer';
import { businessDashboardReducer } from '@/store/business-dashboard-store/business-dashboard.reducer';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
        provideAnimationsAsync(),
        MessageService,
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        provideStore({ article: articleReducer, client: clientReducer, employee: employeeReducer, provider: providerReducer, order: orderReducer, machine: machineReducer, stockTransfer: stockTransferReducer, settings: settingsReducer, articleReturn: articleReturnReducer, category: categoryReducer, subCategory: subCategoryReducer, employeeLedger: employeeLedgerReducer, workTask: workTaskReducer, employeeDashboard: employeeDashboardReducer, businessDashboard: businessDashboardReducer }),
        provideEffects(ArticleEffects, ClientEffects, ProviderEffects, EmployeeEffects, OrderServiceEffects, MachineEffects, StockTransferEffects, SettingsEffects, ArticleReturnEffects, CategoryEffects, SubCategoryEffects, EmployeeLedgerEffects, WorkTaskEffects, EmployeeDashboardEffects, BusinessDashboardEffects),
        provideStoreDevtools({ maxAge: 25 })
    ]
};
