import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

@Injectable({
    providedIn: 'root'
})
export class MachineService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/machine`;

    constructor(private http: HttpClient) {}

    getAllMachines(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl);
    }

    getMachineById(id: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/${id}`);
    }

    createMachine(machine: any): Observable<any> {
        return this.http.post<any>(this.baseUrl, machine);
    }

    updateMachine(id: string, machine: any): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${id}`, machine);
    }

    deleteMachine(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    // Additional helper methods
    getMachinesByStatus(status: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/status/${status}`);
    }

    getMachinesByProvider(providerId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/provider/${providerId}`);
    }
}
