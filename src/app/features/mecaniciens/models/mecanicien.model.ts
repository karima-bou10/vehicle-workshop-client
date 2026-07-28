export interface Mecanicien {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  disponible: boolean;
  //nbInterventionsEnCours: number;
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

export const SPECIALITES = [
  'Mécanique générale',
  'Électricité et électronique',
  'Carrosserie',
  'Climatisation',
  'Diagnostic',
] as const;