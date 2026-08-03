import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
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
    return this.http.get<Page<Mecanicien>>(`${this.base}/getAll`, { params });
  }

  disponibles(page: number, size: number): Observable<Page<Mecanicien>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Mecanicien>>(`${this.base}/getAllDisponibles`, { params });
  }

  rechercher(keyword: string, page: number, size: number): Observable<Page<Mecanicien>> {
    const params = new HttpParams().set('keyword', keyword).set('page', page).set('size', size);
    return this.http.get<Page<Mecanicien>>(`${this.base}/search`, { params });
  }

  parId(id: number): Observable<Mecanicien> {
    return this.http.get<Mecanicien>(`${this.base}/get/${id}`);
  }

  creer(payload: CreateMecanicienRequest): Observable<Mecanicien> {
    return this.http.post<Mecanicien>(`${this.base}/create`, payload);
  }

  modifier(id: number, payload: UpdateMecanicienRequest): Observable<Mecanicien> {
    return this.http.put<Mecanicien>(`${this.base}/update/${id}`, payload);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${id}`, { responseType: 'text' as 'json' });
  }
}
