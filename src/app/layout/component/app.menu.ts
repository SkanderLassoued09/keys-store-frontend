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
                    items: [{ label: 'List Employés', icon: 'pi pi-fw pi-home', routerLink: ['/pages/employee'] }]
                },
                {
                    label: 'Client',
                    items: [{ label: 'List Client', icon: 'pi pi-fw pi-home', routerLink: ['/pages/client'] }]
                },
                {
                    label: 'Service',
                    items: [{ label: 'Order Service', icon: 'pi pi-fw pi-home', routerLink: ['/order-service'] }]
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
