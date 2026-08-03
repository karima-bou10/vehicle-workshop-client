export interface HistoriqueInterventionResponse {
  id: number;
  interventionId: number;
  ancienStatut: string | null;
  nouveauStatut: string;
  commentaire: string | null;
  auteur: string;
  username?: string | null;
  auteurUsername?: string | null;
  // Champ date — plusieurs nommages possibles selon le backend
  date?: string | null;
  dateModification?: string | null;
  dateChangement?: string | null;
  dateCreation?: string | null;
  dateAction?: string | null;
  createdAt?: string | null;
  horodatage?: string | null;
  changedAt?: string | null;
  timestamp?: string | null;
}
