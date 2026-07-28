import { Routes } from '@angular/router';

export const MECANICIENS_ROUTES: Routes = [
  {
    path: '',
    data: { titre: 'Mécaniciens' },
    loadComponent: () =>
      import('./mecanicien-list/mecanicien-list').then(m => m.MecanicienList),
  },
  {
    path: 'nouveau',
    data: { titre: 'Nouveau mécanicien' },
    loadComponent: () =>
      import('./mecanicien-form/mecanicien-form').then(m => m.MecanicienForm),
  },
  {
    path: ':id/modifier',
    data: { titre: 'Modifier le mécanicien' },
    loadComponent: () =>
      import('./mecanicien-form/mecanicien-form').then(m => m.MecanicienForm),
  },
];