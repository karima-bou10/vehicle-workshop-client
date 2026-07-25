import { Injectable } from '@angular/core';
import { AuthUser } from '../models';

const TOKEN_KEY = 'vw.token';
const USER_KEY = 'vw.user';

@Injectable({ providedIn: 'root' })
export class StorageService {

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      this.clear();
      return null;
    }
  }

  saveSession(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}