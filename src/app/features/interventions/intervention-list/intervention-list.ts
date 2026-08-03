import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { InterventionService } from '../services/intervention-service';
import { InterventionResponse } from '../models/intervention.model';
import { VehiculeService } from '../../vehicules/services/vehicule-service';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { PaginatedTable, TableColumn } from '../../../shared/ui/paginated-table/paginated-table';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { Page } from '../../../core/models/page';
import { VehiculeModel } from '../../vehicules/models/vehicule-model';

@Component({
  selector: 'app-intervention-list',
  imports: [DatePipe, StatusTag, PaginatedTable, LoadingSpinner],
  templateUrl: './intervention-list.html',
  styleUrl: './intervention-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionList implements OnInit {
  private readonly interventionService = inject(InterventionService);
  private readonly vehiculeService = inject(VehiculeService);
  private readonly router = inject(Router);

  readonly interventions = signal<InterventionResponse[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly registrationWarning = signal<string | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'id',                     label: '#',             width: '60px' },
    { key: 'typeIntervention',       label: 'Type' },
    { key: 'statut',                 label: 'Statut' },
    { key: 'priorite',               label: 'Priorité' },
    { key: 'immatriculationVehicule', label: 'Véhicule' },
    { key: 'nomMecanicien',          label: 'Mécanicien' },
    { key: 'dateDepot',              label: 'Date dépôt' },
    { key: 'coutEstime',             label: 'Coût estimé', align: 'right' },
    { key: '_actions',               label: '',              width: '120px' },
  ];

  ngOnInit(): void {
    this.loadInterventions();
  }

  private loadInterventions(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.registrationWarning.set(null);
    this.interventionService.getAll().subscribe({
      next: (response: InterventionResponse[]) => {
        this.interventions.set(response);
        this.loading.set(false);
        this.loadVehicleRegistrations(response);
      },
      error: (error: unknown) => {
        console.error('Failed to load interventions.', error);
        this.errorMessage.set('Impossible de charger les interventions.');
        this.loading.set(false);
      }
    });
  }

  private loadVehicleRegistrations(interventions: InterventionResponse[]): void {
    const missingVehicleIds = Array.from(
      new Set(
        interventions
          .filter((intervention) => !intervention.immatriculationVehicule?.trim() && intervention.vehiculeId > 0)
          .map((intervention) => intervention.vehiculeId)
      )
    );

    if (missingVehicleIds.length === 0) {
      return;
    }

    this.vehiculeService.getAllVehicules({ page: 0, size: 1000 }).subscribe({
      next: (page: Page<VehiculeModel>) => {
        const registrationsByVehicleId = new Map(
          page.content.map((vehicule) => [vehicule.id, vehicule.immatriculationFictive])
        );

        this.interventions.set(
          interventions.map((intervention) => ({
            ...intervention,
            immatriculationVehicule:
              intervention.immatriculationVehicule?.trim() ||
              registrationsByVehicleId.get(intervention.vehiculeId) ||
              '—'
          }))
        );
      },
      error: (error: unknown) => {
        console.error('Failed to load vehicle registrations.', error);
        this.interventions.set(
          interventions.map((intervention) => ({
            ...intervention,
            immatriculationVehicule: intervention.immatriculationVehicule?.trim() || '—'
          }))
        );
        this.registrationWarning.set("Impossible de charger certaines immatriculations de vehicules.");
      }
    });
  }

  voirDetail(id: number): void {
    void this.router.navigate(['/interventions', id]);
  }

  allerEdition(id: number): void {
    void this.router.navigate(['/interventions', id, 'edit']);
  }

  creerIntervention(): void {
    void this.router.navigate(['/interventions/new']);
  }

  allerDiagnostic(id: number): void {
    void this.router.navigate(['/interventions', id, 'diagnostic']);
  }

  allerDevis(id: number): void {
    void this.router.navigate(['/interventions', id, 'devis']);
  }

  allerAffectation(id: number): void {
    void this.router.navigate(['/interventions', id, 'affectation']);
  }

  voirHistorique(id: number): void {
    void this.router.navigate(['/interventions', id, 'historique']);
  }
}