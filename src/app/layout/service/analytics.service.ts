import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export interface EmployeeAnalytics {
    employeeId: string;
    fullName: string;
    totalEarned: number;
    bonus: number;
    articlesSold: number;
    servicesHandled: number;
    workOrdersCount: number;
    returnsCount: number;
    advancesTaken: number;
    materialsBorrowedValue: number;
    tasksCount: number;
    productivityScore: number;
}

// ===== Business Intelligence dashboard (GET /analytics/business) =============
// Shapes mirror AnalyticsService.business() on the backend. All money math is
// server-side; the frontend only renders these values.
export interface BusinessKpis {
    totalRevenue: number;
    netRevenue: number;
    grossProfit: number;
    purchaseCost: number;
    profitMargin: number;
    averageTicket: number;
    totalSales: number;
    totalReturns: number;
    articlesSold: number;
    servicesCompleted: number;
    totalCommissions: number;
    returnRate: number;
}

export interface BusinessTrendPoint {
    bucket: string;
    revenue: number;
    profit: number;
    avgTicket: number;
}

export interface BusinessEmployee {
    employeeId: string;
    fullName: string;
    articleRevenue: number;
    serviceRevenue: number;
    totalRevenue: number;
    articlesSold: number;
    servicesCompleted: number;
    returnsProcessed: number;
    articleCommission: number;
    serviceCommission: number;
    totalCommission: number;
    averageSale: number;
    productivityScore: number;
    tasksCompleted: number;
    salaryAdvances: number;
    materialsBorrowed: number;
}

export interface BusinessCategory {
    categoryId: string | null;
    name: string;
    revenue: number;
    quantitySold: number;
    avgSellingPrice: number;
    grossProfit: number;
    returns: number;
}

export interface BusinessArticle {
    articleId: string;
    name: string;
    quantitySold: number;
    revenue: number;
    profit: number;
    returns?: number;
}

export interface BusinessWorstArticle {
    articleId: string;
    name: string;
    quantitySold: number;
    revenue: number;
    shopQuantity: number;
    stockQuantity: number;
}

export interface BusinessSupplier {
    supplierId: string | null;
    name: string;
    revenue: number;
    articlesSold: number;
    profit: number;
    returns: number;
}

export interface BusinessReturns {
    refundCount: number;
    replacementCount: number;
    moneyLost: number;
    returnRate: number;
    topArticles: { name: string; count: number }[];
    topCategories: { name: string; count: number }[];
}

export interface BusinessHighlight {
    name?: string;
    bucket?: string;
    value: number;
}

export interface BusinessSummary {
    bestEmployee: BusinessHighlight | null;
    bestCategory: BusinessHighlight | null;
    bestArticle: BusinessHighlight | null;
    highestRevenueDay: BusinessHighlight | null;
    highestProfitDay: BusinessHighlight | null;
    returnRate: number;
}

export interface BusinessAnalytics {
    range: { start: string; end: string; days: number; granularity: 'hour' | 'day' | 'month' };
    kpis: BusinessKpis;
    trend: BusinessTrendPoint[];
    hourly: { hour: number; revenue: number }[];
    salesMix: { articleRevenue: number; serviceRevenue: number };
    employees: BusinessEmployee[];
    categories: BusinessCategory[];
    bestArticles: BusinessArticle[];
    worstArticles: BusinessWorstArticle[];
    suppliers: BusinessSupplier[];
    returns: BusinessReturns;
    summary: BusinessSummary;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/analytics`;

    constructor(private readonly http: HttpClient) {}

    getEmployees(startDate?: string, endDate?: string): Observable<EmployeeAnalytics[]> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        return this.http.get<EmployeeAnalytics[]>(`${this.baseUrl}/employees`, { params });
    }

    getBusiness(startDate?: string, endDate?: string): Observable<BusinessAnalytics> {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);
        return this.http.get<BusinessAnalytics>(`${this.baseUrl}/business`, { params });
    }
}
