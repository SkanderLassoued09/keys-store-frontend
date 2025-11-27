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

    createProvider(provider: Provider): Observable<Provider> {
        return this.httpClient.post<Provider>(this.baseUrl, provider);
    }

    getAllProviders(): Observable<Provider[]> {
        return this.httpClient.get<Provider[]>(this.baseUrl);
    }

    getProviderById(id: number): Observable<Provider> {
        return this.httpClient.get<Provider>(`${this.baseUrl}/${id}`);
    }

    updateProvider(id: number, provider: Partial<Provider>): Observable<Provider> {
        return this.httpClient.put<Provider>(`${this.baseUrl}/${id}`, provider);
    }

    deleteProvider(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
