import { Intervention } from "../../interventions/models/intervention.model";

export interface Mecanicien {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  disponible: boolean;
  interventions: Intervention[];
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