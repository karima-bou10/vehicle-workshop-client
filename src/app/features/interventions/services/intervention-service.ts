import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
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

  private toBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === 'true' || normalized === '1' || normalized === 'oui';
    }

    return false;
  }

  private normalizeIntervention(intervention: InterventionResponse): InterventionResponse {
    const raw = intervention as unknown as Record<string, unknown>;
    const deletedValue = raw['deleted'] ?? raw['isDeleted'] ?? raw['supprimee'];

    return {
      ...intervention,
      deleted: this.toBoolean(deletedValue)
    };
  }

  private normalizeInterventions(interventions: InterventionResponse[]): InterventionResponse[] {
    return interventions.map((intervention) => this.normalizeIntervention(intervention));
  }

  getAll(): Observable<InterventionResponse[]> {
    return this.http
      .get<InterventionResponse[]>(this.apiUrl)
      .pipe(map((response) => this.normalizeInterventions(response)));
  }

  getHistoriqueComplet(): Observable<InterventionResponse[]> {
    return this.http
      .get<InterventionResponse[]>(`${this.apiUrl}/historique`)
      .pipe(map((response) => this.normalizeInterventions(response)));
  }

  getInterventionsEnRetard(): Observable<InterventionResponse[]> {
    return this.http
      .get<InterventionResponse[]>(`${this.apiUrl}/retards`)
      .pipe(map((response) => this.normalizeInterventions(response)));
  }

  getById(id: number): Observable<InterventionResponse> {
    return this.http
      .get<InterventionResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => this.normalizeIntervention(response)));
  }

  create(payload: CreateInterventionRequest): Observable<InterventionResponse> {
    return this.http
      .post<InterventionResponse>(`${this.apiUrl}/new`, payload)
      .pipe(map((response) => this.normalizeIntervention(response)));
  }
  
  listInterventionsByVehiculeId(vehiculeId: number): Observable<InterventionModel[]> {
    return this.http.get<InterventionModel[]>(`${this.apiUrl}/vehicules/${vehiculeId}/interventions`);
  }

  updateIntervention(id: number, payload: UpdateInterventionRequest): Observable<InterventionResponse> {
    const editUrl = `${this.apiUrl}/${id}/edit`;
    const editPrefixUrl = `${this.apiUrl}/edit/${id}`;
    const directUrl = `${this.apiUrl}/${id}`;
    const updatePrefixUrl = `${this.apiUrl}/${id}/edit`;

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
      }),
      map((response) => this.normalizeIntervention(response))
    );
  }

  updateAffectation(id: number, payload: UpdateAffectationRequest): Observable<InterventionResponse> {
    return this.http
      .put<InterventionResponse>(`${this.apiUrl}/${id}/affecter`, payload)
      .pipe(map((response) => this.normalizeIntervention(response)));
  }

  updateDiagnostic(id: number, payload: UpdateDiagnosticRequest): Observable<InterventionResponse> {
    return this.http
      .put<InterventionResponse>(`${this.apiUrl}/${id}/diagnostic`, payload)
      .pipe(map((response) => this.normalizeIntervention(response)));
  }

  addDevis(id: number, payload: DevisRequest): Observable<InterventionResponse> {
    return this.http
      .put<InterventionResponse>(`${this.apiUrl}/${id}/devis`, payload)
      .pipe(map((response) => this.normalizeIntervention(response)));
  }

  deleteIntervention(id: number): Observable<InterventionResponse> {
    return this.http
      .delete<InterventionResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => this.normalizeIntervention(response)));
  }

  getHistory(id: number): Observable<HistoriqueInterventionResponse[]> {
    return this.http.get<HistoriqueInterventionResponse[]>(`${this.apiUrl}/${id}/historique`);
  }

  updateStatus(id: number, payload: UpdateInterventionStatusRequest): Observable<InterventionResponse> {
    return this.http
      .put<InterventionResponse>(`${this.apiUrl}/${id}/statut`, payload)
      .pipe(map((response) => this.normalizeIntervention(response)));
  }
  
  
}