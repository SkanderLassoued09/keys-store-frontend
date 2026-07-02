import { Component, inject } from '@angular/core';
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
            error: (err) => {
                this.loading = false;
                this.error = err?.error?.message || 'Connexion échouée. Vérifiez vos identifiants.';
            }
        });
    }
}
