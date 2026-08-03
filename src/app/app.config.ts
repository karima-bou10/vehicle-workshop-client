import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAppInitializer, inject } from '@angular/core';
import { firstValueFrom, of, catchError } from 'rxjs';
import { AuthService } from './core/services/auth-service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideCharts(withDefaultRegisterables()),
    provideHttpClient(
      // L'ordre compte : authInterceptor ajoute le token, errorInterceptor traite la réponse.
      withInterceptors([authInterceptor, errorInterceptor]),
    ),
    provideAppInitializer(() => {
  const auth = inject(AuthService);
  if (!auth.getToken()) return;                                          // pas de token → rien à charger
  return firstValueFrom(auth.chargerUtilisateur().pipe(catchError(() => of(null))));  // token invalide → le guard renverra au login
    }),
  ],
};

