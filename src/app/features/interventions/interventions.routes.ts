import { Routes } from '@angular/router';
import { InterventionAffectation } from './intervention-affectation/intervention-affectation';
import { InterventionDevis } from './intervention-devis/intervention-devis';
import { InterventionDiagnostic } from './intervention-diagnostic/intervention-diagnostic';
import { InterventionDetail } from './intervention-detail/intervention-detail';
import { InterventionForm } from './intervention-form/intervention-form';
import { InterventionHistorique } from './intervention-historique/intervention-historique';
import { InterventionList } from './intervention-list/intervention-list';
import { InterventionHistoriqueComplet } from './intervention-historique-complet/intervention-historique-complet';

export const interventionsRoutes: Routes = [
  {
    path: '',
    component: InterventionList
  },
  {
    path: 'historique',
    component: InterventionHistoriqueComplet
  },
  {
    path: 'new',
    component: InterventionForm
  },
  {
    path: ':id/edit',
    component: InterventionForm
  },
  {
    path: ':id/diagnostic',
    component: InterventionDiagnostic
  },
  {
    path: ':id/devis',
    component: InterventionDevis
  },
  {
    path: ':id/affectation',
    component: InterventionAffectation
  },
  {
    path: ':id/historique',
    component: InterventionHistorique
  },
  {
    path: ':id',
    component: InterventionDetail
  }
];