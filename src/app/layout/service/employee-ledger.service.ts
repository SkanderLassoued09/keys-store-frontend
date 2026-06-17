import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export type LedgerType = 'MATERIAL_BORROW' | 'PERSONAL_USE' | 'SALARY_ADVANCE';

export interface EmployeeLedgerEntry {
    _id?: string;
    employee: any;
    type: LedgerType;
    article?: any;
    quantity?: number;
    amount?: number;
    notes?: string;
    date?: string;
    createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class EmployeeLedgerService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/employee-ledger`;

    constructor(private readonly http: HttpClient) {}

    getAll(): Observable<EmployeeLedgerEntry[]> {
        return this.http.get<EmployeeLedgerEntry[]>(this.baseUrl);
    }

    create(payload: Partial<EmployeeLedgerEntry>): Observable<EmployeeLedgerEntry> {
        return this.http.post<EmployeeLedgerEntry>(this.baseUrl, payload);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
