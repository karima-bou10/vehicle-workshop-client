import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AuthUser, LoginRequest, LoginResponse, RoleModel } from '../models';
import { StorageService } from './storage-service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  /** Réhydraté depuis le storage au démarrage de l'application. */
  private readonly _currentUser = signal<AuthUser | null>(this.storage.getUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isManager = computed(() => this.hasRole('ROLE_MANAGER'));

  readonly displayName = computed(() => {
    const u = this._currentUser();
    return u ? `${u.prenom} ${u.nom}` : '';
  });

  readonly initiales = computed(() => {
    const u = this._currentUser();
    return u ? `${u.prenom?.charAt(0) || ''}${u.nom?.charAt(0) || ''}`.toUpperCase() : '';
  });

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(res => {
          const user: AuthUser = {
            username: res.username,
            nom: res.nom,
            prenom: res.prenom,
            roles: res.roles,
          };
          this.storage.saveSession(res.token, user);
          this._currentUser.set(user);
        }),
      );
  }

  /** Vide la session et renvoie sur /login. `expired` affiche le message de session expirée. */
  logout(expired = false): void {
    this.storage.clear();
    this._currentUser.set(null);
    this.router.navigate(['/login'], expired ? { queryParams: { expired: 1 } } : {});
  }

  getToken(): string | null {
    return this.storage.getToken();
  }

  hasRole(role: RoleModel): boolean {
    return this._currentUser()?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: RoleModel[]): boolean {
    const mine = this._currentUser()?.roles;
    return !!mine && roles.some(r => mine.includes(r));
  }
}