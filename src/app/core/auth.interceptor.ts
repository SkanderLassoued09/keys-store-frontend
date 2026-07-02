import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@/layout/service/auth.service';

/**
 * Attaches the Bearer token to every API request and reacts to auth failures:
 * a 401 (expired/invalid token) logs the user out and bounces them to /login.
 * The login call itself is exempt so a bad-credentials 401 shows inline instead
 * of triggering a redirect loop.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const token = auth.getToken();
    const isLoginCall = req.url.includes('/auth/login');

    const authReq = token && !isLoginCall ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next(authReq).pipe(
        catchError((err) => {
            if (err?.status === 401 && !isLoginCall && auth.isAuthenticated()) {
                auth.logout();
            }
            return throwError(() => err);
        })
    );
};
