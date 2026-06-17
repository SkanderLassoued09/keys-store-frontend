import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '@/layout/service/role.service';

/**
 * Admin-only route guard. Blocks non-admin (employee) access even via a direct
 * URL — employees are redirected to the Shop interface. Applied to the
 * admin-only Inventory route.
 */
export const adminGuard: CanActivateFn = () => {
    const role = inject(RoleService);
    const router = inject(Router);
    return role.isAdmin() ? true : router.createUrlTree(['/order-service']);
};
