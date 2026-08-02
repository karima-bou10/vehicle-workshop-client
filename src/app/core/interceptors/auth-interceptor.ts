import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

/** Routes publiques : on n'y attache pas le Bearer. */
const PUBLIC_PATHS = ['/auth/login'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (PUBLIC_PATHS.some(p => req.url.includes(p))) {
    return next(req);
  }

  const token = inject(AuthService).getToken();
  if (!token) return next(req);

  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};