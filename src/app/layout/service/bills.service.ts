import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

@Injectable({
    providedIn: 'root'
})
export class BillsService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/document`;

    constructor(private readonly httpClient: HttpClient) {}

    createBill(bill: any): Observable<any> {
        return this.httpClient.post<any>(this.baseUrl, bill);
    }

    getAllBills(): Observable<any[]> {
        return this.httpClient.get<any[]>(this.baseUrl);
    }

    getBillById(_id: any): Observable<any> {
        return this.httpClient.get<any>(`${this.baseUrl}/${_id}`);
    }

    updateBill(id: number, bill: Partial<any>): Observable<any> {
        return this.httpClient.put<any>(`${this.baseUrl}/${id}`, bill);
    }

    deleteBill(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
