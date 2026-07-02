import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BusinessAnalytics } from '@/layout/service/analytics.service';
import * as BusinessActions from '../store/business-dashboard-store/business-dashboard.actions';
import * as BusinessSelectors from '../store/business-dashboard-store/business-dashboard.selectors';

type RankMetric = 'totalRevenue' | 'totalCommission' | 'articlesSold' | 'servicesCompleted';

@Component({
    selector: 'app-business-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ChartModule, DatePickerModule, TableModule, TagModule],
    templateUrl: './business-dashboard.html',
    styleUrl: './business-dashboard.scss'
})
export class BusinessDashboard implements OnInit {
    private readonly store = inject(Store);
    private readonly destroyRef = inject(DestroyRef);

    loading$ = this.store.select(BusinessSelectors.selectBusinessLoading);
    error$ = this.store.select(BusinessSelectors.selectBusinessError);

    data: BusinessAnalytics | null = null;

    // Range + quick filters (mirror the Inventory Interface filter set).
    dateRange: Date[] = this.currentMonthRange();
    activeFilter: 'today' | 'yesterday' | 'week' | 'month' | 'custom' = 'month';

    // Employee ranking metric toggle (Section 4).
    rankMetric: RankMetric = 'totalRevenue';
    readonly rankMetrics: { key: RankMetric; label: string }[] = [
        { key: 'totalRevenue', label: 'Revenu' },
        { key: 'totalCommission', label: 'Commission' },
        { key: 'articlesSold', label: 'Articles' },
        { key: 'servicesCompleted', label: 'Services' }
    ];

    // Chart models (rebuilt on every data emission).
    revenueTrend: any;
    avgTicketTrend: any;
    employeeRanking: any;
    commissionStacked: any;
    categoryPerf: any;
    bestArticlesChart: any;
    profitChart: any;
    returnsPie: any;
    returnsBar: any;
    supplierPerf: any;
    salesMixPie: any;
    employeeRevenueStacked: any;
    busyHours: any;

    lineOptions: any;
    barOptions: any;
    hBarOptions: any;
    stackedHBarOptions: any;
    stackedBarOptions: any;
    pieOptions: any;

    ngOnInit(): void {
        this.store
            .select(BusinessSelectors.selectBusinessData)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
                this.data = data;
                if (data) this.rebuildCharts(data);
            });
        this.load();
    }

    // ===== Filters ===========================================================
    setQuickFilter(kind: 'today' | 'yesterday' | 'week' | 'month'): void {
        const now = new Date();
        if (kind === 'today') {
            this.dateRange = [new Date(now), new Date(now)];
        } else if (kind === 'yesterday') {
            const y = new Date(now);
            y.setDate(y.getDate() - 1);
            this.dateRange = [y, new Date(y)];
        } else if (kind === 'week') {
            const start = new Date(now);
            start.setDate(start.getDate() - 6);
            this.dateRange = [start, new Date(now)];
        } else {
            this.dateRange = this.currentMonthRange();
        }
        this.activeFilter = kind;
        this.load();
    }

    onRangeChange(range: Date[] | null): void {
        if (!range || !range[0] || !range[1]) return;
        this.activeFilter = 'custom';
        this.load();
    }

    setRankMetric(metric: RankMetric): void {
        this.rankMetric = metric;
        if (this.data) this.buildEmployeeRanking(this.data);
    }

    reload(): void {
        this.load();
    }

    private load(): void {
        const start = new Date(this.dateRange[0]);
        const end = new Date(this.dateRange[1] ?? this.dateRange[0]);
        this.store.dispatch(
            BusinessActions.loadBusinessAnalytics({
                startDate: start.toISOString(),
                endDate: end.toISOString()
            })
        );
    }

    // ===== Chart building ====================================================
    private rebuildCharts(data: BusinessAnalytics): void {
        this.buildOptions();
        this.buildTrends(data);
        this.buildEmployeeRanking(data);
        this.buildCommission(data);
        this.buildCategory(data);
        this.buildBestArticles(data);
        this.buildProfit(data);
        this.buildReturns(data);
        this.buildSupplier(data);
        this.buildSalesMix(data);
        this.buildEmployeeRevenue(data);
        this.buildBusyHours(data);
    }

    private theme() {
        const s = getComputedStyle(document.documentElement);
        return {
            text: s.getPropertyValue('--text-color') || '#334155',
            muted: s.getPropertyValue('--text-color-secondary') || '#64748b',
            border: s.getPropertyValue('--surface-border') || '#e2e8f0',
            primary: s.getPropertyValue('--p-primary-500') || '#6366f1',
            primary300: s.getPropertyValue('--p-primary-300') || '#a5b4fc'
        };
    }

    // A stable, readable categorical palette (theme-independent for many series).
    private readonly palette = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#3b82f6'];

    private buildOptions(): void {
        const t = this.theme();
        const grid = { color: t.border, drawTicks: false };
        const ticks = { color: t.muted };
        const legend = { labels: { color: t.text } };

        this.lineOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: { legend },
            scales: { x: { ticks, grid: { color: 'transparent' } }, y: { ticks, grid } }
        };
        this.barOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: { legend: { display: false } },
            scales: { x: { ticks, grid: { color: 'transparent' } }, y: { ticks, grid } }
        };
        this.hBarOptions = {
            indexAxis: 'y',
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: { legend: { display: false } },
            scales: { x: { ticks, grid }, y: { ticks, grid: { color: 'transparent' } } }
        };
        this.stackedHBarOptions = {
            indexAxis: 'y',
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: { legend },
            scales: { x: { stacked: true, ticks, grid }, y: { stacked: true, ticks, grid: { color: 'transparent' } } }
        };
        this.stackedBarOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: { legend },
            scales: { x: { stacked: true, ticks, grid: { color: 'transparent' } }, y: { stacked: true, ticks, grid } }
        };
        this.pieOptions = {
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: { legend: { position: 'bottom', labels: { color: t.text } } }
        };
    }

    private buildTrends(data: BusinessAnalytics): void {
        const t = this.theme();
        const labels = data.trend.map((p) => this.formatBucket(p.bucket));
        this.revenueTrend = {
            labels,
            datasets: [
                { label: 'Revenu', data: data.trend.map((p) => p.revenue), borderColor: t.primary, backgroundColor: 'transparent', tension: 0.35, fill: false },
                { label: 'Bénéfice', data: data.trend.map((p) => p.profit), borderColor: '#22c55e', backgroundColor: 'transparent', tension: 0.35, fill: false }
            ]
        };
        this.avgTicketTrend = {
            labels,
            datasets: [{ label: 'Panier moyen', data: data.trend.map((p) => p.avgTicket), borderColor: '#f59e0b', backgroundColor: 'transparent', tension: 0.35, fill: false }]
        };
    }

    private buildEmployeeRanking(data: BusinessAnalytics): void {
        const metric = this.rankMetric;
        const rows = [...data.employees].filter((e) => (e as any)[metric] > 0).sort((a, b) => (b as any)[metric] - (a as any)[metric]).slice(0, 10);
        this.employeeRanking = {
            labels: rows.map((e) => e.fullName || 'Sans nom'),
            datasets: [{ data: rows.map((e) => (e as any)[metric]), backgroundColor: this.palette, borderRadius: 6 }]
        };
    }

    private buildCommission(data: BusinessAnalytics): void {
        const rows = [...data.employees].filter((e) => e.totalCommission > 0).sort((a, b) => b.totalCommission - a.totalCommission).slice(0, 10);
        this.commissionStacked = {
            labels: rows.map((e) => e.fullName || 'Sans nom'),
            datasets: [
                { label: 'Commission articles', data: rows.map((e) => e.articleCommission), backgroundColor: '#6366f1', borderRadius: 4 },
                { label: 'Commission services', data: rows.map((e) => e.serviceCommission), backgroundColor: '#22c55e', borderRadius: 4 }
            ]
        };
    }

    private buildCategory(data: BusinessAnalytics): void {
        const rows = data.categories.slice(0, 10);
        this.categoryPerf = {
            labels: rows.map((c) => c.name),
            datasets: [{ data: rows.map((c) => c.revenue), backgroundColor: this.palette, borderRadius: 6 }]
        };
    }

    private buildBestArticles(data: BusinessAnalytics): void {
        const rows = data.bestArticles;
        this.bestArticlesChart = {
            labels: rows.map((a) => a.name),
            datasets: [
                { label: 'Revenu', data: rows.map((a) => a.revenue), backgroundColor: '#6366f1', borderRadius: 4 },
                { label: 'Bénéfice', data: rows.map((a) => a.profit), backgroundColor: '#22c55e', borderRadius: 4 }
            ]
        };
    }

    private buildProfit(data: BusinessAnalytics): void {
        const k = data.kpis;
        this.profitChart = {
            labels: ['Chiffre d’affaires', 'Coût d’achat', 'Bénéfice brut'],
            datasets: [{ data: [k.netRevenue, k.purchaseCost, k.grossProfit], backgroundColor: ['#6366f1', '#ef4444', '#22c55e'], borderRadius: 6 }]
        };
    }

    private buildReturns(data: BusinessAnalytics): void {
        const r = data.returns;
        this.returnsPie = {
            labels: ['Remboursements', 'Remplacements'],
            datasets: [{ data: [r.refundCount, r.replacementCount], backgroundColor: ['#ef4444', '#f59e0b'] }]
        };
        this.returnsBar = {
            labels: r.topArticles.map((a) => a.name),
            datasets: [{ data: r.topArticles.map((a) => a.count), backgroundColor: '#ef4444', borderRadius: 4 }]
        };
    }

    private buildSupplier(data: BusinessAnalytics): void {
        const rows = data.suppliers.slice(0, 10);
        this.supplierPerf = {
            labels: rows.map((s) => s.name),
            datasets: [{ data: rows.map((s) => s.revenue), backgroundColor: this.palette, borderRadius: 6 }]
        };
    }

    private buildSalesMix(data: BusinessAnalytics): void {
        this.salesMixPie = {
            labels: ['Articles', 'Services'],
            datasets: [{ data: [data.salesMix.articleRevenue, data.salesMix.serviceRevenue], backgroundColor: ['#6366f1', '#22c55e'] }]
        };
    }

    private buildEmployeeRevenue(data: BusinessAnalytics): void {
        const rows = [...data.employees].filter((e) => e.totalRevenue > 0).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);
        this.employeeRevenueStacked = {
            labels: rows.map((e) => e.fullName || 'Sans nom'),
            datasets: [
                { label: 'Revenu articles', data: rows.map((e) => e.articleRevenue), backgroundColor: '#6366f1', borderRadius: 4 },
                { label: 'Revenu services', data: rows.map((e) => e.serviceRevenue), backgroundColor: '#22c55e', borderRadius: 4 }
            ]
        };
    }

    private buildBusyHours(data: BusinessAnalytics): void {
        if (!data.hourly?.length) {
            this.busyHours = null;
            return;
        }
        this.busyHours = {
            labels: data.hourly.map((h) => `${String(h.hour).padStart(2, '0')}h`),
            datasets: [{ data: data.hourly.map((h) => h.revenue), backgroundColor: this.theme().primary, borderRadius: 4 }]
        };
    }

    // ===== Helpers ===========================================================
    formatBucket(bucket: string): string {
        if (!bucket) return '';
        if (bucket.includes('T')) return bucket.split('T')[1]?.slice(0, 5) ?? bucket; // hour → HH:00
        const parts = bucket.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}`; // day → DD/MM
        if (parts.length === 2) return `${parts[1]}/${parts[0]}`; // month → MM/YYYY
        return bucket;
    }

    marginSeverity(margin: number): 'success' | 'warn' | 'danger' {
        if (margin >= 25) return 'success';
        if (margin > 0) return 'warn';
        return 'danger';
    }

    private currentMonthRange(): Date[] {
        const now = new Date();
        return [new Date(now.getFullYear(), now.getMonth(), 1), now];
    }
}
