import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Page } from '../../../core/models/page';
import { MecanicienResponse, CreateMecanicienRequest, UpdateMecanicienRequest, MecanicienFiltre } from '../models/mecanicien.model';

@Injectable({
  providedIn: 'root',
})
export class MecanicienService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/mecaniciens`;

  getAllMecaniciens(filtre: MecanicienFiltre): Observable<Page<MecanicienResponse>> {
    let params = new HttpParams()
      .set('page', filtre.page)
      .set('size', filtre.size);

    if (filtre.recherche?.trim()) {
      params = params.set('recherche', filtre.recherche.trim());
    }

    return this.http.get<Page<MecanicienResponse>>(`${this.base}/getAll`, { params });
  }

  getMecanicienById(id: number): Observable<MecanicienResponse> {
    return this.http.get<MecanicienResponse>(`${this.base}/get/${id}`);
  }

  createMecanicien(corps: CreateMecanicienRequest): Observable<MecanicienResponse> {
    return this.http.post<MecanicienResponse>(`${this.base}/create`, corps);
  }

  updateMecanicien(id: number, corps: UpdateMecanicienRequest): Observable<MecanicienResponse> {
    return this.http.put<MecanicienResponse>(`${this.base}/update/${id}`, corps);
  }

  deleteMecanicien(id: number): Observable<string> {
    return this.http.delete<string>(`${this.base}/delete/${id}`);
  }

  getMecaniciensDisponibles(): Observable<MecanicienResponse[]> {
    return this.http.get<MecanicienResponse[]>(`${this.base}/getAllDisponibles`);
  }
}

