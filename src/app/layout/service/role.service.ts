import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

export type UserRole = 'admin' | 'employee';

/**
 * Thin role accessor. Role now comes from the authenticated user (JWT), so this
 * simply delegates to AuthService — keeping the isAdmin()/isEmployee() API that
 * guards, the menu and components already rely on, without them each having to
 * know about AuthService.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
    private readonly auth = inject(AuthService);

    getRole(): UserRole | null {
        return this.auth.getRole();
    }

    isAdmin(): boolean {
        return this.auth.getRole() === 'admin';
    }

    isEmployee(): boolean {
        return this.auth.getRole() === 'employee';
    }

    homePath(): string {
        return this.auth.homePath();
    }
}
