import { StatutIntervention } from "../../../core/models";


export interface InterventionModel {
  id: number;
  reference: string;                       // ex. INT-2026-0142

  vehiculeId: number;
  vehiculeImmatriculation: string;
  vehiculeLibelle: string;                 // "Renault Clio IV"
  clientNom: string;

  demandeClient: string;
  diagnostic: string | null;
  montantDevis: number | null;
  dureeEstimeeHeures: number | null;

  mecanicienId: number | null;
  mecanicienNom: string | null;            // "Karima Bouachra"

  statut: StatutIntervention;
  dateReception: string;
  dateRestitution: string | null;
  derniereModification: string;
}

export interface InterventionRequest {
  vehiculeId: number;
  demandeClient: string;
}

export interface DiagnosticRequest {
  diagnostic: string;
  montantDevis: number;
  dureeEstimeeHeures: number;
}

export interface AffectationRequest {
  mecanicienId: number;
}

export interface ChangementStatutRequest {
  statut: StatutIntervention;
  commentaire: string | null;
}

export interface InterventionFiltre {
  page: number;
  size: number;
  statut?: StatutIntervention | '';
  mecanicienId?: number | null;
  recherche?: string;
}

/** Une ligne de HistoriqueIntervention côté backend. */
export interface HistoriqueIntervention {
  id: number;
  statutPrecedent: StatutIntervention | null;
  statutNouveau: StatutIntervention;
  commentaire: string | null;
  auteur: string;                          // username de l'utilisateur
  dateChangement: string;
}