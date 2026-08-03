import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { DashboardResume, ChargeMecanicien, InterventionApercu  } from '../models/dashboard-model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
private readonly http = inject(HttpClient);
private readonly base = `${environment.apiUrl}/dashboard`;

getResume(): Observable<DashboardResume> {
    return this.http.get<DashboardResume>(`${this.base}/resume`);
}

getChargeMecaniciens(): Observable<ChargeMecanicien[]> {
    return this.http.get<ChargeMecanicien[]>(`${this.base}/charge-mecaniciens`);
}

 interventionsActives(): Observable<InterventionApercu[]> {
    return this.http.get<InterventionApercu[]>(`${this.base}/interventions-actives`);
  }
}