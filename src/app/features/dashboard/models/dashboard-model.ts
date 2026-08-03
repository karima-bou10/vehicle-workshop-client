import { StatutIntervention } from "../../../core/models/statut-intervention-model"

export interface StatutCompteur {
  statut: StatutIntervention;
  nombre: number;
}

export interface DashboardResume {
  recuesAujourdhui: number;
  enDiagnostic: number;
  enReparation: number;
  terminees: number;
  retardsRestitution: number;
  repartitionStatuts: StatutCompteur[];
}

export interface ChargeMecanicien {
  mecanicienId: number;
  mecanicienNom: string;
  nombreInterventionsActives: number;
}

export interface InterventionApercu {
  id: number;
  vehiculeImmatriculation: string;
  type: string;
  statut: string;
  dateDepot: string;
}