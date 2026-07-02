import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { RoleService } from '../service/role.service';

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
export class AppMenu implements OnInit {
    model: MenuItem[] = [];
    private readonly roleService = inject(RoleService);

    ngOnInit() {
        // The menu IS the navigation surface, so it's built from the role, not
        // the URL. Employees get the operational interface only; owners get the
        // full admin menu. Route guards enforce the same split against direct URLs.
        this.model = this.roleService.isEmployee() ? this.employeeMenu() : this.ownerMenu();
    }

    // ===== Employee interface: operational tools only =====
    private employeeMenu(): MenuItem[] {
        return [
            {
                label: 'Espace employé',
                items: [
                    { label: 'Shop Interface', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/order-service'] },
                    { label: 'Tableau des tâches', icon: 'pi pi-fw pi-check-square', routerLink: ['/pages/work-task'] }
                ]
            }
        ];
    }

    // ===== Owner interface: full system control =====
    private ownerMenu(): MenuItem[] {
        return [
            {
                label: 'Analytique',
                items: [{ label: 'Tableau de bord BI', icon: 'pi pi-fw pi-chart-line', routerLink: ['/pages/business-dashboard'] }]
            },
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
                    { label: 'Shop Interface', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/order-service'] },
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
                    { label: 'Utilisateurs & accès', icon: 'pi pi-fw pi-users', routerLink: ['/pages/users'] },
                    { label: 'Catégories', icon: 'pi pi-fw pi-images', routerLink: ['/pages/category'] },
                    { label: 'Sous-catégories', icon: 'pi pi-fw pi-sitemap', routerLink: ['/pages/sub-category'] }
                ]
            }
        ];
    }
}
