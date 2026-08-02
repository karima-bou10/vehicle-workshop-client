import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development'; 
import { HistoriqueInterventionResponse } from '../models/historique.model';
import {
  CreateInterventionRequest,
  DevisRequest,
  InterventionResponse,
  UpdateAffectationRequest,
  UpdateDiagnosticRequest,
  UpdateInterventionStatusRequest
} from '../models/intervention.model';

@Injectable({
  providedIn: 'root'
})
export class InterventionService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/intervention`;

  getAll(): Observable<InterventionResponse[]> {
    return this.http.get<InterventionResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<InterventionResponse> {
    return this.http.get<InterventionResponse>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateInterventionRequest): Observable<InterventionResponse> {
    return this.http.post<InterventionResponse>(`${this.apiUrl}/new`, payload);
  }

  updateIntervention(id: number, payload: any): Observable<InterventionResponse> {
    return this.http.put<InterventionResponse>(`${this.apiUrl}/${id}`, payload);
  }

  updateAffectation(id: number, payload: UpdateAffectationRequest): Observable<InterventionResponse> {
    return this.http.put<InterventionResponse>(`${this.apiUrl}/${id}/affecter`, payload);
  }

  updateDiagnostic(id: number, payload: UpdateDiagnosticRequest): Observable<InterventionResponse> {
    return this.http.put<InterventionResponse>(`${this.apiUrl}/${id}/diagnostic`, payload);
  }

  addDevis(id: number, payload: DevisRequest): Observable<InterventionResponse> {
    return this.http.put<InterventionResponse>(`${this.apiUrl}/${id}/devis`, payload);
  }

  deleteIntervention(id: number): Observable<InterventionResponse> {
    return this.http.delete<InterventionResponse>(`${this.apiUrl}/${id}`);
  }

  getHistory(id: number): Observable<HistoriqueInterventionResponse[]> {
    return this.http.get<HistoriqueInterventionResponse[]>(`${this.apiUrl}/${id}/historique`);
  }

  updateStatus(id: number, payload: UpdateInterventionStatusRequest): Observable<InterventionResponse> {
    return this.http.put<InterventionResponse>(`${this.apiUrl}/${id}/statut`, payload);
  }
}