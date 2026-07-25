export type StatutIntervention =
  | 'RECUE'
  | 'DIAGNOSTIC_EN_COURS'
  | 'DEVIS_A_VALIDER'
  | 'EN_REPARATION'
  | 'TERMINEE'
  | 'RESTITUEE'
  | 'ANNULEE';

export type StatusVariant  = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

interface StatusMetadata {
  label: string;
  variant: StatusVariant ;
}

export const STATUT_METADATA: Record<StatutIntervention, StatusMetadata> = {
  RECUE:               { label: 'Reçue',               variant: 'neutral' },
  DIAGNOSTIC_EN_COURS: { label: 'Diagnostic en cours', variant: 'info'    },
  DEVIS_A_VALIDER:     { label: 'Devis à valider',     variant: 'warning' },
  EN_REPARATION:       { label: 'En réparation',       variant: 'info'    },
  TERMINEE:            { label: 'Terminée',            variant: 'success' },
  RESTITUEE:           { label: 'Restituée',           variant: 'success' },
  ANNULEE:             { label: 'Annulée',             variant: 'danger'  },
};

/** Ordre du workflow métier — sert au workflow-stepper. Annulée en est exclue. */
export const WORKFLOW_ORDRE: StatutIntervention[] = [
  'RECUE',
  'DIAGNOSTIC_EN_COURS',
  'DEVIS_A_VALIDER',
  'EN_REPARATION',
  'TERMINEE',
  'RESTITUEE',
];