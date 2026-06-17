import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    `
})
export class AppMenu implements OnInit, OnDestroy {
    isServiceOrder = false;
    model: MenuItem[] = [];
    private routerSub!: Subscription;

    constructor(private router: Router) {}

    ngOnInit() {
        // 🔁 React to URL changes
        this.routerSub = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.updateMenuBasedOnUrl();
        });

        // Run once on init (in case user reloads page)
        this.updateMenuBasedOnUrl();
    }

    private updateMenuBasedOnUrl(): void {
        const segments = this.router.url.split('/');
        const serviceName = segments[2]; // e.g. "order-service"

        this.isServiceOrder = serviceName === 'order-service';

        if (!this.isServiceOrder) {
            this.model = [
                {
                    label: 'Article',
                    items: [{ label: 'List Article', icon: 'pi pi-fw pi-home', routerLink: ['/pages/article'] }]
                },
                {
                    label: 'Fournisseur',
                    items: [{ label: 'List Fournisseur', icon: 'pi pi-fw pi-home', routerLink: ['/pages/provider'] }]
                },
                {
                    label: 'Employeurs',
                    items: [
                        { label: 'Tableau de bord', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/pages/employee-dashboard'] },
                        { label: 'List Employés', icon: 'pi pi-fw pi-home', routerLink: ['/pages/employee'] },
                        { label: 'Registre employé', icon: 'pi pi-fw pi-book', routerLink: ['/pages/employee-ledger'] }
                    ]
                },
                {
                    label: 'Client',
                    items: [{ label: 'List Client', icon: 'pi pi-fw pi-home', routerLink: ['/pages/client'] }]
                },
                {
                    label: 'Machine',
                    items: [{ label: 'List machine', icon: 'pi pi-fw pi-home', routerLink: ['/pages/machine'] }]
                },
                {
                    label: 'Service',
                    items: [
                        { label: 'Inventory Interface', icon: 'pi pi-fw pi-home', routerLink: ['/pages/order-service-list'] },
                        { label: 'Shop Interface', icon: 'pi pi-fw pi-home', routerLink: ['/order-service'] },
                        { label: 'Article Returns', icon: 'pi pi-fw pi-undo', routerLink: ['/pages/article-return'] }
                    ]
                },
                {
                    label: 'Tâches',
                    items: [{ label: 'Tableau des tâches', icon: 'pi pi-fw pi-check-square', routerLink: ['/pages/work-task'] }]
                },
                {
                    label: 'Paramètres',
                    items: [
                        { label: 'Catégories', icon: 'pi pi-fw pi-images', routerLink: ['/pages/category'] },
                        { label: 'Sous-catégories', icon: 'pi pi-fw pi-sitemap', routerLink: ['/pages/sub-category'] }
                    ]
                }
            ];
        } else {
            this.model = [
                {
                    label: 'XYZ',
                    items: [{ label: 'Test', icon: 'pi pi-fw pi-home', routerLink: ['/pages/article'] }]
                }
            ];
        }
    }

    ngOnDestroy() {
        this.routerSub.unsubscribe();
    }
}
