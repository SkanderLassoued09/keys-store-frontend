import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export interface AppUser {
    id: string;
    username: string;
    role: 'admin' | 'employee';
    displayName: string;
    employee: string | null;
    employeeName?: string | null;
    isActive: boolean;
}

// Owner-only login-account management (all endpoints are @Roles('admin')).
@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${API_CONFIG.baseUrl}/auth/users`;

    getAll(): Observable<AppUser[]> {
        return this.http.get<AppUser[]>(this.baseUrl);
    }

    create(payload: { username: string; password: string; role: string; displayName?: string; employee?: string | null }): Observable<AppUser> {
        return this.http.post<AppUser>(this.baseUrl, payload);
    }

    update(id: string, payload: Partial<{ isActive: boolean; role: string; displayName: string; employee: string | null; newPassword: string }>): Observable<AppUser> {
        return this.http.patch<AppUser>(`${this.baseUrl}/${id}`, payload);
    }
}
