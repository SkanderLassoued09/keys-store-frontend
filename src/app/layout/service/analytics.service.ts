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
}
