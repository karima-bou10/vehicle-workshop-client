import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../core/models';
import { Mecanicien, CreateMecanicienRequest, UpdateMecanicienRequest } from '../models/mecanicien.model';

@Injectable({
  providedIn: 'root',
})
export class MecanicienService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/mecaniciens`;

  lister(page: number, size: number): Observable<Page<Mecanicien>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Mecanicien>>(this.base, { params });
  }

  /** Liste non paginée des mécaniciens actifs */
  disponibles(): Observable<Mecanicien[]> {
    return this.http.get<Mecanicien[]>(`${this.base}/disponibles`);
  }

  parId(id: number): Observable<Mecanicien> {
    return this.http.get<Mecanicien>(`${this.base}/${id}`);
  }

  creer(payload: CreateMecanicienRequest): Observable<Mecanicien> {
    return this.http.post<Mecanicien>(this.base, payload);
  }

  modifier(id: number, payload: UpdateMecanicienRequest): Observable<Mecanicien> {
    return this.http.put<Mecanicien>(`${this.base}/${id}`, payload);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
