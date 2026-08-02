export interface VehiculeModel {
  id: number;
  immatriculationFictive: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  clientFictif: string;
}

export interface VehiculeRequest {
  immatriculationFictive: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  clientFictif: string;
}

export interface VehiculeFiltre {
  page: number;
  size: number;
  search?: string;
}