import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { AppLayout } from './shared/layout/app-layout/app-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
    title: 'Connexion — Atelier',
  },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        data: { titre: 'Tableau de bord' },
        loadComponent: () =>
          import('./features/dashboard/dashboard-home/dashboard-home').then(m => m.DashboardHome),
      },

      {
        path: 'vehicules',
        data: { titre: 'Véhicules' },
        loadChildren: () => import('./features/vehicules/vehicules.routes').then(m => m.VEHICULES_ROUTES),
      },
      {
        path: 'interventions',
        data: { titre: 'Interventions' },
        loadChildren: () =>
          import('./features/interventions/interventions.routes').then(m => m.interventionsRoutes),
      },
      // { path: 'mecaniciens', ... },  // + canActivate: [roleGuard('ROLE_MANAGER')]
    ],
  },
  { path: '**', redirectTo: '' },
];
