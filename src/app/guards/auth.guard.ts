import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@/layout/service/auth.service';

// Requires a logged-in user. Unauthenticated access (UI or direct URL) is sent
// to /login, preserving the intended destination for post-login redirect.
export const authGuard: CanActivateFn = (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.isAuthenticated()) return true;
    return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};

export const authChildGuard: CanActivateChildFn = (route, state) => authGuard(route, state);
