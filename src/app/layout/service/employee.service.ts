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
    private readonly baseUrl = `${API_CONFIG.baseUrl}/employees`;

    constructor(private readonly httpClient: HttpClient) {}

    createEmployee(employee: Employee): Observable<Employee> {
        return this.httpClient.post<Employee>(this.baseUrl, employee);
    }

    getAllEmployees(): Observable<Employee[]> {
        return this.httpClient.get<Employee[]>(this.baseUrl);
    }

    getEmployeeById(id: number): Observable<Employee> {
        return this.httpClient.get<Employee>(`${this.baseUrl}/${id}`);
    }

    updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
        return this.httpClient.put<Employee>(`${this.baseUrl}/${id}`, employee);
    }

    deleteEmployee(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
