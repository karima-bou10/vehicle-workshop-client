import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleModel } from '../models';
import { AuthService } from '../services/auth-service';
import { NotificationService } from '../services/notification-service';

export const roleGuard = (...roles: RoleModel[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notif = inject(NotificationService);

  if (auth.hasAnyRole(roles)) return true;

  notif.warning("Cette page est réservée au responsable d'atelier.");
  return router.createUrlTree(['/dashboard']);
};