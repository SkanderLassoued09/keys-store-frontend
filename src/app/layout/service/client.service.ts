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
    private readonly baseUrl = `${API_CONFIG.baseUrl}/clients`;

    constructor(private readonly httpClient: HttpClient) {}

    createClient(client: Client): Observable<Client> {
        return this.httpClient.post<Client>(this.baseUrl, client);
    }

    getAllClients(): Observable<Client[]> {
        return this.httpClient.get<Client[]>(this.baseUrl);
    }

    getClientById(id: number): Observable<Client> {
        return this.httpClient.get<Client>(`${this.baseUrl}/${id}`);
    }

    updateClient(id: number, client: Partial<Client>): Observable<Client> {
        return this.httpClient.put<Client>(`${this.baseUrl}/${id}`, client);
    }

    deleteClient(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
