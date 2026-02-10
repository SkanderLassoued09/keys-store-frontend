import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export interface Provider {
    _id?: number;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProviderService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/provider`;

    constructor(private readonly httpClient: HttpClient) {}

    createProvider(provider: any): Observable<any> {
        return this.httpClient.post<Provider>(this.baseUrl, provider);
    }

    getAllProviders(): Observable<any[]> {
        return this.httpClient.get<any[]>(this.baseUrl);
    }

    getProviderById(id: string): Observable<any> {
        return this.httpClient.get<any>(`${this.baseUrl}/${id}`);
    }

    updateProvider(id: string, provider: Partial<any>): Observable<any> {
        return this.httpClient.put<any>(`${this.baseUrl}/${id}`, provider);
    }

    deleteProvider(id: string): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
