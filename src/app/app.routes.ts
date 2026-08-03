import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { AppLayout } from './shared/layout/app-layout/app-layout';
import { roleGuard } from './core/guards/role-guard';

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
    
      {
        path: 'mecaniciens',
        data: { titre: 'Mécaniciens' },
        canActivate: [roleGuard('ROLE_MANAGER')],
        loadChildren: () => import('./features/mecaniciens/mecaniciens.routes').then(m => m.MECANICIENS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
