export interface InterventionResponse {
  id: number;
  typeIntervention: string;
  descriptionClient: string;
  diagnostic: string | null;
  statut: string;
  priorite: string;
  coutEstime: number | null;
  dateDepot: string;
  dateRestitutionPrevue: string;
  dateCloture: string | null;
  vehiculeId: number;
  immatriculationVehicule: string | null;
  mecanicienId: number | null;
  nomMecanicien: string | null;
}

export type InterventionType =
  | 'DIAGNOSTIC'
  | 'REVISION'
  | 'REPARATION'
  | 'CONTROLE'
  | 'PNEUMATIQUES'
  | 'AUTRE';

export type InterventionStatus =
  | 'RECUE'
  | 'DIAGNOSTIC_EN_COURS'
  | 'DEVIS_A_VALIDER'
  | 'EN_REPARATION'
  | 'TERMINEE'
  | 'RESTITUEE'
  | 'ANNULEE';

export type InterventionPriority = 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';

export const INTERVENTION_TYPES: readonly InterventionType[] = [
  'DIAGNOSTIC',
  'REVISION',
  'REPARATION',
  'CONTROLE',
  'PNEUMATIQUES',
  'AUTRE'
];

export const INTERVENTION_STATUSES: readonly InterventionStatus[] = [
  'RECUE',
  'DIAGNOSTIC_EN_COURS',
  'DEVIS_A_VALIDER',
  'EN_REPARATION',
  'TERMINEE',
  'RESTITUEE',
  'ANNULEE'
];

export const INTERVENTION_PRIORITIES: readonly InterventionPriority[] = [
  'BASSE',
  'MOYENNE',
  'HAUTE',
  'URGENTE'
];

export interface CreateInterventionRequest {
  vehiculeId: number;
  typeIntervention: InterventionType;
  descriptionClient: string;
  priorite: InterventionPriority;
  dateDepot: string;
  dateRestitutionPrevue: string;
}

export interface UpdateInterventionRequest {
  typeIntervention: InterventionType;
  descriptionClient: string;
  priorite: InterventionPriority;
  dateRestitutionPrevue: string;
}

export interface UpdateDiagnosticRequest {
  diagnostic: string;
}

export interface UpdateAffectationRequest {
  mecanicienId: number;
}

export interface DevisRequest {
  coutEstime: number;
}

export interface UpdateInterventionStatusRequest {
  nouveauStatut: InterventionStatus;
  auteur?: string;
  commentaire?: string;
}

export interface Intervention {
  id: number | string;
  reference: string;
  customerName: string;
  vehicleLabel: string;
  interventionType: string;
  status: string;
  priority: string;
  slaStatus: string;
  createdAt: string | null;
  dueAt: string | null;
  assignedMechanic: string;
}
