export interface MecanicienResponse {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  disponible: boolean;
}

export interface CreateMecanicienRequest {
  nom: string;
  prenom: string;
  specialite: string;
}

export interface UpdateMecanicienRequest {
  nom: string;
  prenom: string;
  specialite: string;
  disponible: boolean;
}

export interface MecanicienFiltre {
  page: number;
  size: number;
  recherche?: string;
}
