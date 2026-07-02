import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { RoleService } from '@/layout/service/role.service';
import { AuthService } from '@/layout/service/auth.service';

/**
 * Strict interface separation for the owner (admin) shell.
 *
 * The AppLayout shell hosts every owner/admin page (dashboard, uikit, docs and
 * all /pages/* screens). Employees belong to the operational interface only, so
 * inside the shell they may reach the task board and NOTHING else. Any other
 * shell URL — whether clicked or typed directly — bounces them back to the Shop.
 *
 * Applied once as `canActivateChild` on the AppLayout route, so it covers all
 * current and future shell children automatically (no per-route opt-in to miss).
 */
const EMPLOYEE_SHELL_ALLOWED = ['/pages/work-task'];

export const shellChildGuard: CanActivateChildFn = (_child, state) => {
    const auth = inject(AuthService);
    const role = inject(RoleService);
    const router = inject(Router);

    // Must be logged in first — otherwise send to the login screen.
    if (!auth.isAuthenticated()) {
        return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
    }

    if (role.isAdmin()) return true;

    const path = state.url.split('?')[0];
    const allowed = EMPLOYEE_SHELL_ALLOWED.some((p) => path === p || path.startsWith(p + '/'));
    return allowed ? true : router.createUrlTree(['/order-service']);
};
