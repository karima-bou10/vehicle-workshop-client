export type TypeIntervention =
  | 'DIAGNOSTIC' | 'REVISION' | 'REPARATION' | 'CONTROLE' | 'PNEUMATIQUES' | 'AUTRE';

export const TYPE_LABELS: Record<TypeIntervention, string> = {
  DIAGNOSTIC: 'Diagnostic',
  REVISION: 'Révision',
  REPARATION: 'Réparation',
  CONTROLE: 'Contrôle',
  PNEUMATIQUES: 'Pneumatiques',
  AUTRE: 'Autre',
};

export type Priorite = 'BASSE' | 'NORMALE' | 'HAUTE';

export const PRIORITE_LABELS: Record<Priorite, string> = {
  BASSE: 'Basse',
  NORMALE: 'Normale',
  HAUTE: 'Haute',
};

/** Réponse GET (InterventionResponse côté back). */
export interface Intervention {
  id: number;
  vehiculeId: number;
  vehiculeImmatriculation: string;      // vehicule.immatriculationFictive aplati par le back
  type: TypeIntervention;
  descriptionClient: string | null;
  diagnostic: string | null;
  priorite: Priorite;
  mecanicienId: number | null;
  coutEstime: number | null;
  dateDepot: string;                    // ISO
  dateRestitutionPrevue: string | null;
  dateCloture: string | null;
}
