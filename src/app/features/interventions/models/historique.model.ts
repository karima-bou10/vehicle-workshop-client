export interface HistoriqueInterventionResponse {
  id: number;
  interventionId: number;
  ancienStatut: string | null;
  nouveauStatut: string;
  commentaire: string | null;
  auteur: string;
  date: string;
}