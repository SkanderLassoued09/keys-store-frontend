import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_CONFIG } from 'src/api.config';

export type UserRole = 'admin' | 'employee';

export interface AuthUser {
    id: string;
    username: string;
    role: UserRole;
    displayName: string;
    employee: string | null;
    isActive: boolean;
}

interface LoginResponse {
    token: string;
    user: AuthUser;
}

/**
 * Single source of truth for authentication state. Holds the JWT + current user
 * (persisted to localStorage so a refresh stays logged in) and exposes the role
 * used by guards, the menu and the two-interface split. This is the seam to a
 * real login — everything else reads role/identity from here.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly baseUrl = `${API_CONFIG.baseUrl}/auth`;
    private readonly TOKEN_KEY = 'authToken';
    private readonly USER_KEY = 'authUser';

    private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.readUser());
    readonly user$ = this.userSubject.asObservable();

    login(username: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { username, password }).pipe(
            tap((res) => {
                localStorage.setItem(this.TOKEN_KEY, res.token);
                localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
                this.userSubject.next(res.user);
            })
        );
    }

    logout(redirect = true): void {
        try {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
        } catch {
            /* ignore */
        }
        this.userSubject.next(null);
        if (redirect) this.router.navigateByUrl('/login');
    }

    getToken(): string | null {
        try {
            return localStorage.getItem(this.TOKEN_KEY);
        } catch {
            return null;
        }
    }

    getUser(): AuthUser | null {
        return this.userSubject.value;
    }

    isAuthenticated(): boolean {
        return !!this.getToken() && !!this.getUser();
    }

    getRole(): UserRole | null {
        return this.getUser()?.role ?? null;
    }

    // Landing page per interface: employees → Shop, owners → admin shell.
    homePath(): string {
        return this.getRole() === 'employee' ? '/order-service' : '/';
    }

    private readUser(): AuthUser | null {
        try {
            const raw = localStorage.getItem(this.USER_KEY);
            return raw ? (JSON.parse(raw) as AuthUser) : null;
        } catch {
            return null;
        }
    }
}
