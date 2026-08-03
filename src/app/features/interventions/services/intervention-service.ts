import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development'; 
import { HistoriqueInterventionResponse } from '../models/historique.model';
import {
  CreateInterventionRequest,
  DevisRequest,
  InterventionResponse,
  UpdateInterventionRequest,
  UpdateAffectationRequest,
  UpdateDiagnosticRequest,
  UpdateInterventionStatusRequest
} from '../models/intervention.model';
import { InterventionModel } from '../models/intervention-model';

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
  
  listInterventionsByVehiculeId(vehiculeId: number): Observable<InterventionModel[]> {
    return this.http.get<InterventionModel[]>(`${this.apiUrl}/vehicules/${vehiculeId}/interventions`);
  }

  updateIntervention(id: number, payload: UpdateInterventionRequest): Observable<InterventionResponse> {
    const editUrl = `${this.apiUrl}/${id}/edit`;
    const editPrefixUrl = `${this.apiUrl}/edit/${id}`;
    const directUrl = `${this.apiUrl}/${id}`;
    const updatePrefixUrl = `${this.apiUrl}/update/${id}`;

    return this.http.put<InterventionResponse>(editUrl, payload).pipe(
      catchError((firstError: HttpErrorResponse) => {
        if (firstError.status !== 404) {
          return throwError(() => firstError);
        }

        return this.http.put<InterventionResponse>(editPrefixUrl, payload).pipe(
          catchError((secondError: HttpErrorResponse) => {
            if (secondError.status !== 404) {
              return throwError(() => secondError);
            }

            return this.http.put<InterventionResponse>(directUrl, payload).pipe(
              catchError((thirdError: HttpErrorResponse) => {
                if (thirdError.status !== 404) {
                  return throwError(() => thirdError);
                }

                return this.http.put<InterventionResponse>(updatePrefixUrl, payload);
              })
            );
          })
        );
      })
    );
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