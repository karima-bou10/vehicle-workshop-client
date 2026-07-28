import { Injectable } from '@angular/core';
import { AuthUser } from '../models';

const TOKEN_KEY = 'vw.token';

@Injectable({ providedIn: 'root' })
export class StorageService {

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}