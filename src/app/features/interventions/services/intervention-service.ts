import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriqueInterventionResponse } from '../models/historique.model';
import {
  CreateInterventionRequest,
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

  private apiUrl = 'http://localhost:8080/api/intervention';

  getAll(): Observable<InterventionResponse[]> {
    return this.http.get<InterventionResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<InterventionResponse> {
    return this.http.get<InterventionResponse>(`${this.apiUrl}/${id}`);
  }

  getHistory(id: number): Observable<HistoriqueInterventionResponse[]> {
    return this.http.get<HistoriqueInterventionResponse[]>(`${this.apiUrl}/${id}/historique`);
  }

  create(payload: CreateInterventionRequest): Observable<InterventionResponse> {
    return this.http.post<InterventionResponse>(this.apiUrl, payload);
  }

  updateDiagnostic(id: number, payload: UpdateDiagnosticRequest): Observable<InterventionResponse> {
    return this.http.put<InterventionResponse>(`${this.apiUrl}/${id}/diagnostic`, payload);
  }

  updateAffectation(id: number, payload: UpdateAffectationRequest): Observable<InterventionResponse> {
    return this.http.put<InterventionResponse>(`${this.apiUrl}/${id}/affectation`, payload);
  }

  updateStatus(id: number, payload: UpdateInterventionStatusRequest): Observable<InterventionResponse> {
    return this.http.put<InterventionResponse>(`${this.apiUrl}/${id}/statut`, payload);
  }
}
}