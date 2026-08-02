import { InterventionResponse } from './intervention.model';
import { INTERVENTION_TYPES, type InterventionStatus } from './intervention.model';

export type KnownInterventionStatus =
  | 'RECUE'
  | 'DIAGNOSTIC_EN_COURS'
  | 'DEVIS_A_VALIDER'
  | 'EN_REPARATION'
  | 'TERMINEE'
  | 'RESTITUEE'
  | 'ANNULEE'
  | 'UNKNOWN';

export interface InterventionWorkflowStep {
  key: Exclude<KnownInterventionStatus, 'ANNULEE' | 'UNKNOWN'>;
  label: string;
  description?: string;
}

export interface InterventionRuleCheck {
  id: string;
  label: string;
  satisfied: boolean;
  details: string;
}

export const INTERVENTION_WORKFLOW_STEPS: InterventionWorkflowStep[] = [
  { key: 'RECUE', label: 'Recue' },
  { key: 'DIAGNOSTIC_EN_COURS', label: 'Diagnostic en cours' },
  { key: 'DEVIS_A_VALIDER', label: 'Devis a valider' },
  { key: 'EN_REPARATION', label: 'En reparation' },
  { key: 'TERMINEE', label: 'Terminee' },
  { key: 'RESTITUEE', label: 'Restituee' }
];

const STATUS_LABELS: Record<KnownInterventionStatus, string> = {
  RECUE: 'Recue',
  DIAGNOSTIC_EN_COURS: 'Diagnostic en cours',
  DEVIS_A_VALIDER: 'Devis a valider',
  EN_REPARATION: 'En reparation',
  TERMINEE: 'Terminee',
  RESTITUEE: 'Restituee',
  ANNULEE: 'Annulee',
  UNKNOWN: 'Statut inconnu'
};

const COST_REQUIRED_STATUSES: KnownInterventionStatus[] = [
  'DEVIS_A_VALIDER',
  'EN_REPARATION',
  'TERMINEE',
  'RESTITUEE'
];

const MECHANIC_REQUIRED_STATUSES: KnownInterventionStatus[] = [
  'EN_REPARATION',
  'TERMINEE',
  'RESTITUEE'
];

const WORKFLOW_ORDER: readonly InterventionStatus[] = [
  'RECUE',
  'DIAGNOSTIC_EN_COURS',
  'DEVIS_A_VALIDER',
  'EN_REPARATION',
  'TERMINEE',
  'RESTITUEE'
];

function sanitizeValue(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function normalizeInterventionStatus(value: string | null | undefined): KnownInterventionStatus {
  const normalizedValue = sanitizeValue(value);

  switch (normalizedValue) {
    case 'RECUE':
    case 'RECU':
      return 'RECUE';
    case 'DIAGNOSTIC_EN_COURS':
      return 'DIAGNOSTIC_EN_COURS';
    case 'DEVIS_A_VALIDER':
      return 'DEVIS_A_VALIDER';
    case 'EN_REPARATION':
      return 'EN_REPARATION';
    case 'TERMINEE':
      return 'TERMINEE';
    case 'RESTITUEE':
      return 'RESTITUEE';
    case 'ANNULEE':
      return 'ANNULEE';
    default:
      return 'UNKNOWN';
  }
}

export function getInterventionStatusLabel(value: string | null | undefined): string {
  const knownStatus = normalizeInterventionStatus(value);
  return knownStatus === 'UNKNOWN' ? value?.trim() || STATUS_LABELS.UNKNOWN : STATUS_LABELS[knownStatus];
}

export function getWorkflowStepState(
  currentStatus: string | null | undefined,
  stepKey: InterventionWorkflowStep['key']
): 'done' | 'current' | 'pending' | 'blocked' {
  const normalizedStatus = normalizeInterventionStatus(currentStatus);
  const currentIndex = INTERVENTION_WORKFLOW_STEPS.findIndex((step) => step.key === normalizedStatus);
  const stepIndex = INTERVENTION_WORKFLOW_STEPS.findIndex((step) => step.key === stepKey);

  if (normalizedStatus === 'ANNULEE' || normalizedStatus === 'UNKNOWN' || currentIndex === -1) {
    return 'blocked';
  }

  if (stepIndex < currentIndex) {
    return 'done';
  }

  if (stepIndex === currentIndex) {
    return 'current';
  }

  return 'pending';
}

export function getInterventionRuleChecks(intervention: InterventionResponse): InterventionRuleCheck[] {
  const normalizedStatus = normalizeInterventionStatus(intervention.statut);
  const hasVehicle = intervention.vehiculeId > 0 && (intervention.immatriculationVehicule?.trim().length ?? 0) > 0;
  const normalizedType = sanitizeValue(intervention.typeIntervention);
  const hasValidType = INTERVENTION_TYPES.includes(normalizedType as (typeof INTERVENTION_TYPES)[number]);
  const requiresEstimatedCost = COST_REQUIRED_STATUSES.includes(normalizedStatus);
  const hasEstimatedCost = (intervention.coutEstime ?? 0) > 0;
  const requiresMechanic = MECHANIC_REQUIRED_STATUSES.includes(normalizedStatus);
  const hasMechanic = (intervention.mecanicienId ?? 0) > 0 && (intervention.nomMecanicien?.trim().length ?? 0) > 0;
  const currentWorkflowIndex = WORKFLOW_ORDER.findIndex((status) => status === normalizedStatus);
  const followsWorkflow = normalizedStatus === 'ANNULEE' || currentWorkflowIndex >= 0;

  return [
    {
      id: 'RG-AUTO-01',
      label: 'Vehicule obligatoire',
      satisfied: hasVehicle,
      details: hasVehicle
        ? 'Intervention correctement liee a un vehicule.'
        : 'Chaque intervention doit rester associee a un vehicule.'
    },
    {
      id: 'RG-AUTO-02',
      label: 'Type intervention valide',
      satisfied: hasValidType,
      details: hasValidType
        ? 'Le type d intervention fait partie de la liste autorisee.'
        : 'Le type doit etre: Diagnostic, Revision, Reparation, Controle, Pneumatiques ou Autre.'
    },
    {
      id: 'RG-AUTO-04',
      label: 'Workflow de statuts',
      satisfied: followsWorkflow,
      details: followsWorkflow
        ? 'Le statut courant appartient au workflow metier attendu.'
        : 'Statut invalide pour le workflow atelier.'
    },
    {
      id: 'RG-AUTO-05',
      label: 'Cout estime avant devis',
      satisfied: !requiresEstimatedCost || hasEstimatedCost,
      details: requiresEstimatedCost
        ? hasEstimatedCost
        ? "Le cout estime est renseigne pour ce niveau d'avancement."
          : 'Le cout estime doit etre renseigne avant le passage a "Devis a valider".'
        : 'Le cout estime devient obligatoire a partir de "Devis a valider".'
    },
    {
      id: 'RG-AUTO-06',
      label: 'Affectation avant reparation',
      satisfied: !requiresMechanic || hasMechanic,
      details: requiresMechanic
        ? hasMechanic
          ? 'Un mecanicien est bien affecte a cette intervention.'
          : 'Un mecanicien disponible est obligatoire avant le passage en reparation.'
        : 'Le mecanicien devient obligatoire a partir de "En reparation".'
    },
    {
      id: 'RG-AUTO-07',
      label: 'Restitution reservee au manager',
      satisfied: normalizedStatus !== 'RESTITUEE',
      details:
        normalizedStatus === 'RESTITUEE'
          ? 'La restitution doit etre validee cote backend par un responsable atelier.'
          : 'La restitution reste reservee au responsable atelier.'
    }
  ];
}

export function getNextWorkflowStatus(currentStatus: string | null | undefined): InterventionStatus | null {
  const normalizedStatus = normalizeInterventionStatus(currentStatus);

  if (normalizedStatus === 'ANNULEE' || normalizedStatus === 'UNKNOWN') {
    return null;
  }

  const currentIndex = WORKFLOW_ORDER.findIndex((status) => status === normalizedStatus);
  if (currentIndex === -1 || currentIndex === WORKFLOW_ORDER.length - 1) {
    return null;
  }

  return WORKFLOW_ORDER[currentIndex + 1];
}

export function canTransitionToStatus(
  intervention: InterventionResponse,
  targetStatus: InterventionStatus
): { allowed: boolean; reason: string | null } {
  const normalizedStatus = normalizeInterventionStatus(intervention.statut);

  if (targetStatus === 'ANNULEE') {
    return normalizedStatus === 'RESTITUEE'
      ? { allowed: false, reason: 'Une intervention restituee ne peut plus etre annulee.' }
      : { allowed: true, reason: null };
  }

  const nextStatus = getNextWorkflowStatus(intervention.statut);
  if (nextStatus !== targetStatus) {
    return {
      allowed: false,
      reason: 'Transition invalide: suivez la sequence Recue -> Diagnostic -> Devis -> Reparation -> Terminee -> Restituee.'
    };
  }

  if (targetStatus === 'DEVIS_A_VALIDER' && (intervention.coutEstime ?? 0) <= 0) {
    return {
      allowed: false,
      reason: 'Le cout estime est obligatoire avant le passage a Devis a valider.'
    };
  }

  if (targetStatus === 'EN_REPARATION') {
    const hasMechanic = (intervention.mecanicienId ?? 0) > 0 && (intervention.nomMecanicien?.trim().length ?? 0) > 0;
    if (!hasMechanic) {
      return {
        allowed: false,
        reason: 'Un mecanicien disponible est obligatoire avant le passage en reparation.'
      };
    }
  }

  if (targetStatus === 'RESTITUEE' && normalizedStatus !== 'TERMINEE') {
    return {
      allowed: false,
      reason: 'La restitution n est possible que depuis le statut Terminee.'
    };
  }

  return { allowed: true, reason: null };
}
