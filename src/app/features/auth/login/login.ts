import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth-service';
import { NotificationService } from '../../../core/services/notification-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notif = inject(NotificationService);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly passwordVisible = signal(false);

  /** Redirection après connexion : ?redirect=/interventions/12 sinon /dashboard */
  private readonly redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/dashboard';

  constructor() {
    if (this.route.snapshot.queryParamMap.has('expired')) {
      this.error.set('Votre session a expiré. Connectez-vous à nouveau.');
    }
    // Already logged in: skip showing the login page.
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl(this.redirect);
    }
  }

  togglePassword(): void {
    this.passwordVisible.update(v => !v);
  }

  submit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.notif.success('Connexion réussie.');
        this.router.navigateByUrl(this.redirect);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set(
          err.status === 400 || err.status === 401 || err.status === 403
            ? 'Identifiant ou mot de passe incorrect.'
            : "Connexion impossible. Le serveur ne répond pas.",
        );
      },
    });
  }

  isInvalid(nom: 'username' | 'password'): boolean {
    const c = this.form.controls[nom];
    return c.invalid && (c.touched || c.dirty);
  }
}