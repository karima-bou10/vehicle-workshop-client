import { Routes } from '@angular/router';

export const VEHICULES_ROUTES: Routes = [
  {
    path: '',
    data: { titre: 'Véhicules' },
    loadComponent: () => import('./vehicule-list/vehicule-list').then(m => m.VehiculeList),
  },
  {
    path: 'nouveau',
    data: { titre: 'Nouveau véhicule' },
    loadComponent: () => import('./vehicule-form/vehicule-form').then(m => m.VehiculeForm),
  },
  {
    path: ':id',
    data: { titre: 'Fiche véhicule' },
    loadComponent: () => import('./vehicule-detail/vehicule-detail').then(m => m.VehiculeDetail),
  },
  {
    path: ':id/modifier',
    data: { titre: 'Modifier le véhicule' },
    loadComponent: () => import('./vehicule-form/vehicule-form').then(m => m.VehiculeForm),
  },
];