import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export interface Client {
    id?: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/client`;

    constructor(private readonly httpClient: HttpClient) {}

    createClient(client: any): Observable<any> {
        return this.httpClient.post<any>(this.baseUrl, client);
    }

    getAllClients(): Observable<any[]> {
        return this.httpClient.get<any[]>(this.baseUrl);
    }

    getClientById(id: number): Observable<any> {
        return this.httpClient.get<any>(`${this.baseUrl}/${id}`);
    }

    updateClient(id: number, client: Partial<any>): Observable<any> {
        return this.httpClient.put<any>(`${this.baseUrl}/${id}`, client);
    }

    deleteClient(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
