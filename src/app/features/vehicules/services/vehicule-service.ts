import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Page } from '../../../core/models/page';
import { VehiculeModel, VehiculeFiltre, VehiculeRequest } from '../models/vehicule-model';

@Injectable({ providedIn: 'root' })
export class VehiculeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/vehicules`;

  getAllVehicules(filtre: VehiculeFiltre): Observable<Page<VehiculeModel>> {
    let params = new HttpParams()
      .set('page', filtre.page)
      .set('size', filtre.size);

    if (filtre.search?.trim()) {
      params = params.set('search', filtre.search.trim());
    }

    return this.http.get<Page<VehiculeModel>>(`${this.base}/getVehicules`, { params });
  }

  getVehiculeById(id: number): Observable<VehiculeModel> {
    return this.http.get<VehiculeModel>(`${this.base}/${id}`);
  }

  createVehicule(corps: VehiculeRequest): Observable<VehiculeModel> {
    return this.http.post<VehiculeModel>(this.base, corps);
  }

  updateVehicule(id: number, corps: VehiculeRequest): Observable<VehiculeModel> {
    return this.http.put<VehiculeModel>(`${this.base}/${id}`, corps);
  }

  deleteVehicule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}