import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

@Injectable({
    providedIn: 'root'
})
export class MachineService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/machine`;

    constructor(private readonly httpClient: HttpClient) {}

    createMachine(machine: any): Observable<any> {
        return this.httpClient.post<any>(this.baseUrl, machine);
    }

    getAllMachines(): Observable<any[]> {
        return this.httpClient.get<any[]>(this.baseUrl);
    }

    getMachineById(id: number): Observable<any> {
        return this.httpClient.get<any>(`${this.baseUrl}/${id}`);
    }

    updateMachine(id: number, machine: Partial<any>): Observable<any> {
        return this.httpClient.put<any>(`${this.baseUrl}/${id}`, machine);
    }

    deleteMachine(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
