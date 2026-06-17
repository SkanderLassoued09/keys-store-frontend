import { Injectable } from '@angular/core';

export type UserRole = 'admin' | 'employee';

/**
 * Lightweight role holder. There is no auth backend yet, so the current role is
 * read from localStorage and defaults to 'admin' (so existing admin usage is
 * unaffected). Switching a device to 'employee' makes the admin route guard
 * block restricted areas. This is the single hook to wire into a real login.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
    private readonly KEY = 'userRole';

    getRole(): UserRole {
        try {
            return localStorage.getItem(this.KEY) === 'employee' ? 'employee' : 'admin';
        } catch {
            return 'admin';
        }
    }

    isAdmin(): boolean {
        return this.getRole() === 'admin';
    }

    setRole(role: UserRole): void {
        try {
            localStorage.setItem(this.KEY, role);
        } catch {
            /* ignore storage errors */
        }
    }
}
