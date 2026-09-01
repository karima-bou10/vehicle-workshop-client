import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { InterventionService } from '../services/intervention-service';
import { InterventionResponse } from '../models/intervention.model';
import { VehiculeService } from '../../vehicules/services/vehicule-service';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { PaginatedTable, TableColumn } from '../../../shared/ui/paginated-table/paginated-table';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Page } from '../../../core/models/page';
import { VehiculeModel } from '../../vehicules/models/vehicule-model';

@Component({
  selector: 'app-intervention-historique-complet',
  standalone: true,
  imports: [DatePipe, StatusTag, PaginatedTable, LoadingSpinner, EmptyState],
  templateUrl: './intervention-historique-complet.html',
  styleUrl: './intervention-historique-complet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionHistoriqueComplet implements OnInit {
  private readonly interventionService = inject(InterventionService);
  private readonly vehiculeService = inject(VehiculeService);
  private readonly router = inject(Router);

  readonly interventions = signal<InterventionResponse[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly registrationWarning = signal<string | null>(null);
  readonly referenceSearch = signal('');
  readonly deletedFilter = signal('');

  readonly filteredInterventions = computed(() => {
    const referenceSearch = this.referenceSearch().trim().toLowerCase();
    const deletedFilter = this.deletedFilter();

    return this.interventions().filter((intervention) => {
      const reference = String(intervention.reference ?? '').toLowerCase();
      const matchesReference = !referenceSearch || reference.includes(referenceSearch);
      const matchesDeleted =
        !deletedFilter ||
        (deletedFilter === 'supprimee' && intervention.deleted) ||
        (deletedFilter === 'non-supprimee' && !intervention.deleted);

      return matchesReference && matchesDeleted;
    });
  });

  readonly columns: TableColumn[] = [
    { key: 'id', label: 'reference', width: '60px' },
    { key: 'typeIntervention', label: 'Type' },
    { key: 'statut', label: 'Statut' },
    { key: 'priorite', label: 'Priorité' },
    { key: 'immatriculationVehicule', label: 'Véhicule' },
    { key: 'nomMecanicien', label: 'Mécanicien' },
    { key: 'dateDepot', label: 'Date dépôt' },
    { key: 'coutEstime', label: 'Coût estimé', align: 'right' },
    { key: 'deleted', label: 'Supprimée' }
  ];

  ngOnInit(): void {
    this.loadHistoriqueComplet();
  }

  private loadHistoriqueComplet(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.registrationWarning.set(null);

    this.interventionService.getHistoriqueComplet().subscribe({
      next: (response: InterventionResponse[]) => {
        this.interventions.set(response);
        this.loading.set(false);
        this.loadVehicleRegistrations(response);
      },
      error: (error: unknown) => {
        console.error('Failed to load historical interventions.', error);
        this.errorMessage.set('Impossible de charger l\'historique complet des interventions.');
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

  retourListeInterventions(): void {
    void this.router.navigate(['/interventions']);
  }
}
