export interface HistoriqueInterventionResponse {
  id: number;
  ancienStatut: string | null;
  nouveauStatut: string;
  commentaire: string | null;
  auteur: string;
  dateModification: string;
}