import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment.development";
import { Page, StatutIntervention } from "../../../core/models";
import { InterventionFiltre, HistoriqueIntervention, InterventionRequest, DiagnosticRequest, AffectationRequest, ChangementStatutRequest, InterventionModel } from "../models/intervention-model";

@Injectable({ providedIn: 'root' })
export class InterventionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/interventions`;

  // ---------- Lecture ----------

  lister(filtre: InterventionFiltre): Observable<Page<InterventionModel>> {
    let params = new HttpParams().set('page', filtre.page).set('size', filtre.size);

    if (filtre.statut) params = params.set('statut', filtre.statut);
    if (filtre.mecanicienId) params = params.set('mecanicienId', filtre.mecanicienId);
    if (filtre.recherche?.trim()) params = params.set('recherche', filtre.recherche.trim());

    return this.http.get<Page<InterventionModel>>(this.base, { params });
  }

  parId(id: number): Observable<InterventionModel> {
    return this.http.get<InterventionModel>(`${this.base}/${id}`);
  }

  getInterventionsByVehiculeId(vehiculeId: number): Observable<InterventionModel[]> {
    return this.http.get<InterventionModel[]>(`${environment.apiUrl}/vehicules/${vehiculeId}/interventions`);
  }

  historique(id: number): Observable<HistoriqueIntervention[]> {
    return this.http.get<HistoriqueIntervention[]>(`${this.base}/${id}/historique`);
  }

  // ---------- Écriture ----------

  creer(corps: InterventionRequest): Observable<InterventionModel> {
    return this.http.post<InterventionModel>(this.base, corps);
  }

  enregistrerDiagnostic(id: number, corps: DiagnosticRequest): Observable<InterventionModel> {
    return this.http.patch<InterventionModel>(`${this.base}/${id}/diagnostic`, corps);
  }

  affecter(id: number, corps: AffectationRequest): Observable<InterventionModel> {
    return this.http.patch<InterventionModel>(`${this.base}/${id}/affectation`, corps);
  }

  // ---------- Transitions du workflow ----------

  demarrerDiagnostic(id: number)  { return this.transition(id, 'DIAGNOSTIC_EN_COURS'); }
  envoyerDevis(id: number)        { return this.transition(id, 'DEVIS_A_VALIDER'); }
  validerDevis(id: number)        { return this.transition(id, 'EN_REPARATION'); }
  terminer(id: number)            { return this.transition(id, 'TERMINEE'); }
  restituer(id: number)           { return this.transition(id, 'RESTITUEE'); }

  annuler(id: number, motif: string) {
    return this.transition(id, 'ANNULEE', motif);
  }

  private transition(
    id: number,
    statut: StatutIntervention,
    commentaire: string | null = null,
  ): Observable<InterventionModel> {
    const corps: ChangementStatutRequest = { statut, commentaire };
    return this.http.patch<InterventionModel>(`${this.base}/${id}/statut`, corps);
  }
}