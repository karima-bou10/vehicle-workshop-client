export type StatutIntervention =
  | 'RECUE'
  | 'DIAGNOSTIC_EN_COURS'
  | 'DEVIS_A_VALIDER'
  | 'EN_REPARATION'
  | 'TERMINEE'
  | 'RESTITUEE'
  | 'ANNULEE';

export type StatusVariant  = 'neutral' | 'warning' | 'success' | 'danger' | 'primary' | 'success-soft' | 'neutral-soft';

interface StatusMetadata {
  label: string;
  variant: StatusVariant ;
}

export const STATUT_METADATA: Record<StatutIntervention, StatusMetadata> = {
  RECUE:               { label: 'Reçue',               variant: 'neutral-soft' },
  DIAGNOSTIC_EN_COURS: { label: 'Diagnostic en cours', variant: 'warning'    },
  DEVIS_A_VALIDER:     { label: 'Devis à valider',     variant: 'neutral' },
  EN_REPARATION:       { label: 'En réparation',       variant: 'primary'    },
  TERMINEE:            { label: 'Terminée',            variant: 'success' },
  RESTITUEE:           { label: 'Restituée',           variant: 'success-soft' },
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