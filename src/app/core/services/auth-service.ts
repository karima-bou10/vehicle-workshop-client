import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AuthUser, LoginRequest, LoginResponse, RoleModel} from '../models';
import { StorageService } from './storage-service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}/auth`;

  private readonly _currentUser = signal<AuthUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isManager = computed(() => this._currentUser()?.role === 'ROLE_MANAGER');

  readonly displayName = computed(() => this._currentUser()?.username ?? '');
  readonly initiales = computed(() => {
    const u = this._currentUser();
    return u ? u.username.charAt(0).toUpperCase() : '';
  });

  /** Login : POST /login rend le token, puis GET /me rend l'identité. */
  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http.post<LoginResponse>(`${this.base}/login`, credentials).pipe(
      tap(res => this.storage.saveToken(res.token)),   // 1. on ne garde que le token
      switchMap(() => this.chargerUtilisateur()),       // 2. puis on enchaîne sur /me
    );
  }

  /** Récupère { username, role } via /me. Utilisé au login ET au démarrage. */
  chargerUtilisateur(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.base}/me`).pipe(
      tap(user => this._currentUser.set(user)),
    );
  }

  logout(expired = false): void {
    this.storage.clear();
    this._currentUser.set(null);
    this.router.navigate(['/login'], expired ? { queryParams: { expired: 1 } } : {});
  }

  getToken(): string | null {
    return this.storage.getToken();
  }

  hasRole(role: RoleModel): boolean {
    return this._currentUser()?.role === role;
  }

  hasAnyRole(roles: RoleModel[]): boolean {
    const mine = this._currentUser()?.role;
    return !!mine && roles.includes(mine);
  }
}