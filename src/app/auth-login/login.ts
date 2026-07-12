import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '@/layout/service/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class LoginPage {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    loading = false;
    error = '';

    form = new FormGroup({
        username: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required)
    });

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.loading = true;
        this.error = '';
        const { username, password } = this.form.value;

        this.auth.login(username!, password!).subscribe({
            next: (res) => {
                // Employees always land in the Shop; owners follow the intended
                // redirect (or the admin home). Prevents an employee bouncing off
                // an admin URL they can't reach.
                const redirect = this.route.snapshot.queryParamMap.get('redirect');
                const target = res.user.role === 'employee' ? '/order-service' : redirect && !redirect.startsWith('/login') ? redirect : '/';
                this.router.navigateByUrl(target);
            },
            error: (err: HttpErrorResponse) => {
                this.loading = false;
                this.error = this.messageForError(err);
            }
        });
    }

    // Distinguish the failure modes so the user gets an accurate message instead
    // of the raw "Failed to fetch". Angular's withFetch surfaces a network
    // failure (server unreachable, CORS, wrong host) as status 0.
    private messageForError(err: HttpErrorResponse): string {
        if (err.status === 0) return 'Serveur injoignable. Vérifiez votre connexion.';
        if (err.status === 401) return 'Identifiants incorrects.';
        if (err.status >= 500) return 'Erreur serveur. Réessayez plus tard.';
        // 400 / others: prefer the backend's message when it sent one.
        return err?.error?.message || 'Connexion échouée. Réessayez.';
    }
}
