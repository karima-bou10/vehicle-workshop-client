import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Intervention } from '../models/intervention.model';

export interface InterventionCreatePayload {
  id: number | null;
  typeIntervention: string;
  descriptionClient: string;
  diagnostic: string;
  statut: string;
  priorite: string;
  coutEstime: number;
  dateDepot: string;
  dateRestitutionPrevue: string | null;
  dateCloture: string | null;
  vehiculeId: number;
  mecanicienId: number;
}

@Injectable({
  providedIn: 'root',
})
export class InterventionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/intervention';

  getInterventions(): Observable<Intervention[]> {
    return this.http.get<unknown>(this.apiUrl).pipe(
      map((payload) => this.extractItems(payload).map((item) => this.normalize(item)))
    );
  }

  getInterventionById(id: number | string): Observable<Intervention> {
    return this.http.get<unknown>(`${this.apiUrl}/${id}`).pipe(
      map((payload) => this.extractOne(payload)),
      map((item) => this.normalize(item))
    );
  }

  createIntervention(payload: InterventionCreatePayload): Observable<unknown> {
    return this.http.post(this.apiUrl, payload);
  }

  private extractItems(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) {
      return payload.filter(this.isRecord);
    }

    if (!this.isRecord(payload)) {
      return [];
    }

    const candidates = [
      payload['content'],
      payload['data'],
      payload['items'],
      payload['results']
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate.filter(this.isRecord);
      }
    }

    return [];
  }

  private extractOne(payload: unknown): Record<string, unknown> {
    if (Array.isArray(payload)) {
      const first = payload.find(this.isRecord);

      if (first) {
        return first;
      }

      return {};
    }

    if (!this.isRecord(payload)) {
      return {};
    }

    const candidates = [
      payload['data'],
      payload['item'],
      payload['result'],
      payload['intervention']
    ];

    for (const candidate of candidates) {
      if (this.isRecord(candidate)) {
        return candidate;
      }
    }

    return payload;
  }

  private normalize(item: Record<string, unknown>): Intervention {
    const vehicle = this.pickFirstString(item, [
      'vehicleLabel',
      'vehiculeLabel',
      'vehicleRegistration',
      'immatriculation',
      'plaqueImmatriculation'
    ]);
    const brand = this.pickFirstString(item, ['marqueVehicule', 'vehicleBrand', 'marque']);
    const model = this.pickFirstString(item, ['modeleVehicule', 'vehicleModel', 'modele']);
    const createdAt = this.pickFirstString(item, ['createdAt', 'dateCreation', 'createdDate']);
    const dueAt = this.pickFirstString(item, ['dueAt', 'dateEcheance', 'deadline']);
    const vehicleFallback = [brand, model].filter(Boolean).join(' ');

    return {
      id:
        (item['id'] as number | string | undefined) ??
        this.pickFirstString(item, ['reference', 'numero']) ??
        crypto.randomUUID(),
      reference: this.pickFirstString(item, ['reference', 'numero', 'code']) ?? 'Sans reference',
      customerName: this.pickFirstString(item, ['customerName', 'clientName', 'nomClient']) ?? 'Client inconnu',
      vehicleLabel: (vehicle ?? vehicleFallback) || 'Vehicule non renseigne',
      interventionType: this.pickFirstString(item, ['interventionType', 'typeIntervention', 'type']) ?? 'Non renseigne',
      status: this.pickFirstString(item, ['status', 'statut']) ?? 'EN_ATTENTE',
      priority: this.pickFirstString(item, ['priority', 'priorite']) ?? 'NORMALE',
      slaStatus: this.pickFirstString(item, ['slaStatus', 'statutSla']) ?? 'A_VERIFIER',
      createdAt: createdAt ?? null,
      dueAt: dueAt ?? null,
      assignedMechanic: this.pickFirstString(item, ['assignedMechanic', 'mecanicienAssigne', 'technicianName']) ?? 'Non assigne'
    };
  }

  private pickFirstString(
    item: Record<string, unknown>,
    keys: string[]
  ): string | undefined {
    for (const key of keys) {
      const value = item[key];

      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }

    return undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
