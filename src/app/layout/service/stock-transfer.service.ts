import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export interface CreateStockTransferPayload {
    articleId: string;
    quantity: number;
    employeeId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class StockTransferService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/stock-transfer`;

    constructor(private http: HttpClient) {}

    create(payload: CreateStockTransferPayload): Observable<any> {
        return this.http.post<any>(this.baseUrl, payload);
    }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl);
    }
}
