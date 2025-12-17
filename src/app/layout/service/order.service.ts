import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/work-order`;

    constructor(private readonly httpClient: HttpClient) {}

    // Create a new order
    createOrder(order: any): Observable<any> {
        return this.httpClient.post<any>(this.baseUrl, order);
    }

    // Get all orders
    getAllOrders(): Observable<any[]> {
        return this.httpClient.get<any[]>(this.baseUrl);
    }

    // Get order by ID
    getOrderById(id: number): Observable<any> {
        return this.httpClient.get<any>(`${this.baseUrl}/${id}`);
    }

    // Update order by ID
    updateOrder(id: number, order: Partial<any>): Observable<any> {
        return this.httpClient.put<any>(`${this.baseUrl}/${id}`, order);
    }

    // Delete order by ID
    deleteOrder(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
