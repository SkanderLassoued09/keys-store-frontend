import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import * as DashboardActions from '../store/employee-dashboard-store/employee-dashboard.actions';
import * as DashboardSelectors from '../store/employee-dashboard-store/employee-dashboard.selectors';

@Component({
    selector: 'app-employee-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, DatePickerModule, TagModule],
    templateUrl: './employee-dashboard.html',
    styleUrl: './employee-dashboard.scss'
})
export class EmployeeDashboard implements OnInit {
    private readonly store = inject(Store);
    private readonly router = inject(Router);

    employees$ = this.store.select(DashboardSelectors.selectDashboardEmployees);
    loading$ = this.store.select(DashboardSelectors.selectDashboardLoading);
    totals$ = this.store.select(DashboardSelectors.selectDashboardTotals);

    // Range picker — defaults to the current month.
    dateRange: Date[] = this.currentMonthRange();

    ngOnInit(): void {
        this.load();
    }

    onRangeChange(range: Date[] | null): void {
        if (!range || !range[0]) return;
        // Wait until both ends are chosen before reloading.
        if (!range[1]) return;
        this.load();
    }

    private load(): void {
        const start = new Date(this.dateRange[0]);
        const end = new Date(this.dateRange[1] ?? this.dateRange[0]);
        this.store.dispatch(
            DashboardActions.loadEmployeeAnalytics({
                startDate: start.toISOString(),
                endDate: end.toISOString()
            })
        );
    }

    // ===== Part 2: restored employee features (standalone, NOT Inventory) =====
    openEmployeeLedger(): void {
        this.router.navigate(['/pages/employee-ledger']);
    }

    openNewTask(): void {
        this.router.navigate(['/pages/work-task']);
    }

    productivitySeverity(score: number): 'success' | 'warn' | 'danger' {
        if (score >= 1) return 'success';
        if (score > 0) return 'warn';
        return 'danger';
    }

    initials(fullName: string): string {
        return (fullName || '?')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('');
    }

    private currentMonthRange(): Date[] {
        const now = new Date();
        return [new Date(now.getFullYear(), now.getMonth(), 1), now];
    }
}
