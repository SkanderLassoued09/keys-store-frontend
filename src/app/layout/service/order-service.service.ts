import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/work-order`;
    constructor(private http: HttpClient) {}

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl);
    }

    getById(id: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/${id}`);
    }
    // ✅ Add this method for bulk insert
    createMultiple(orderServices: any[]): Observable<any[]> {
        return this.http.post<any[]>(`${this.baseUrl}/bulk`, { orderServices });
        // Or if your backend expects the array directly:
        // return this.http.post<any[]>(`${this.apiUrl}/bulk`, orderServices);
    }

    create(order: Partial<any>): Observable<any> {
        return this.http.post<any>(this.baseUrl, order);
    }

    update(id: string, order: Partial<any>): Observable<any> {
        return this.http.patch<any>(`${this.baseUrl}/${id}`, order);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
