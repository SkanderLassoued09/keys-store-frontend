import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export interface Employee {
    id?: number;
    firstName: string;
    lastName: string;
    position?: string;
    email?: string;
    phone?: string;
}

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/employee`;

    constructor(private readonly httpClient: HttpClient) {}

    createEmployee(employee: any): Observable<Employee> {
        return this.httpClient.post<any>(this.baseUrl, employee);
    }

    getAllEmployees(): Observable<any[]> {
        return this.httpClient.get<any[]>(this.baseUrl);
    }

    getEmployeeById(id: number): Observable<any> {
        return this.httpClient.get<any>(`${this.baseUrl}/${id}`);
    }

    updateEmployee(id: number, employee: Partial<any>): Observable<any> {
        return this.httpClient.put<any>(`${this.baseUrl}/${id}`, employee);
    }

    deleteEmployee(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
