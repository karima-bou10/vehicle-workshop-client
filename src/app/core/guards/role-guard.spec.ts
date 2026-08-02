import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { roleGuard } from './role-guard';
import { AuthService } from '../services/auth-service';
import { NotificationService } from '../services/notification-service';

describe('roleGuard', () => {
  let authServiceStub: Pick<AuthService, 'hasAnyRole'>;
  let notificationServiceStub: Pick<NotificationService, 'warning'>;
  let routerStub: Pick<Router, 'createUrlTree'>;
  let hasAnyRoleResult = false;
  let warningCalledWith: string | null = null;
  let createUrlTreeCalledWith: unknown[] | null = null;
  const dashboardTree = {} as UrlTree;

  beforeEach(() => {
    hasAnyRoleResult = false;
    warningCalledWith = null;
    createUrlTreeCalledWith = null;

    authServiceStub = {
      hasAnyRole: () => hasAnyRoleResult
    };
    notificationServiceStub = {
      warning: (message: string) => {
        warningCalledWith = message;
      }
    };
    routerStub = {
      createUrlTree: (commands: unknown[]) => {
        createUrlTreeCalledWith = commands;
        return dashboardTree;
      }
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: NotificationService, useValue: notificationServiceStub },
        { provide: Router, useValue: routerStub }
      ]
    });
  });

  it('autorise l accès quand l utilisateur a le role requis', () => {
    hasAnyRoleResult = true;

    const result = TestBed.runInInjectionContext(() =>
      roleGuard('ROLE_MANAGER')({} as never, {} as never)
    );

    expect(result).toBe(true);
    expect(warningCalledWith).toBeNull();
  });

  it('redirige vers dashboard quand le role est manquant', () => {
    hasAnyRoleResult = false;

    const result = TestBed.runInInjectionContext(() =>
      roleGuard('ROLE_MANAGER')({} as never, {} as never)
    );

    expect(warningCalledWith).toBe(
      "Cette page est réservée au responsable d'atelier."
    );
    expect(createUrlTreeCalledWith).toEqual(['/dashboard']);
    expect(result).toBe(dashboardTree);
  });
});
