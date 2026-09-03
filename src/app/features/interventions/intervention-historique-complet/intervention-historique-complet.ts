import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { InterventionService } from '../services/intervention-service';
import { InterventionResponse } from '../models/intervention.model';

import { VehiculeService } from '../../vehicules/services/vehicule-service';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import {
  PaginatedTable,
  TableColumn
} from '../../../shared/ui/paginated-table/paginated-table';

import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';

import { Page } from '../../../core/models/page';
import { VehiculeModel } from '../../vehicules/models/vehicule-model';

@Component({
  selector: 'app-intervention-historique-complet',
  standalone: true,
  imports: [
    DatePipe,
    StatusTag,
    PaginatedTable,
    LoadingSpinner,
    EmptyState
  ],
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

  // Recherche par référence
  readonly searchGlobale = signal('');

  currentPage = 0;

  pageSize = 10;

  readonly page = signal<Page<InterventionResponse>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    first: true,
    last: true
  });

  readonly columns: TableColumn[] = [
    {
      key: 'reference',
      label: 'Référence',
      width: '120px'
    },
    {
      key: 'typeIntervention',
      label: 'Type'
    },
    {
      key: 'statut',
      label: 'Statut'
    },
    {
      key: 'priorite',
      label: 'Priorité'
    },
    {
      key: 'immatriculationVehicule',
      label: 'Véhicule'
    },
    {
      key: 'nomMecanicien',
      label: 'Mécanicien'
    },
    {
      key: 'dateDepot',
      label: 'Date dépôt'
    },
    {
      key: 'coutEstime',
      label: 'Coût estimé',
      align: 'right'
    },
    {
      key: 'deleted',
      label: 'Archivée'
    }
  ];

  ngOnInit(): void {
    this.loadHistoriqueComplet();
  }

  private loadHistoriqueComplet(): void {

    this.loading.set(true);
    this.errorMessage.set(null);
    this.registrationWarning.set(null);

    const reference = this.searchGlobale().trim();

    console.log('reference =', reference);
    console.log('hasSearch =', !!reference);

    /*
     * Sans recherche :
     * → historique complet
     *
     * Avec recherche :
     * → méthode search() existante
     */
      const hasSearch = !!reference;

      const request$ = hasSearch
        ? this.interventionService.search(
            {
              reference,
              includeArchived: true
            },
            this.currentPage,
            this.pageSize
          )
        : this.interventionService.getHistoriqueComplet(
            this.currentPage,
            this.pageSize
          );

    request$.subscribe({
      next: (response: Page<InterventionResponse>) => {

        this.page.set(response);

        this.interventions.set(response.content);

        this.loading.set(false);

        this.loadVehicleRegistrations(response.content);
      },

      error: (error: unknown) => {

        console.error(
          'Failed to load historical interventions.',
          error
        );

        this.errorMessage.set(
          'Impossible de charger l\'historique complet des interventions.'
        );

        this.loading.set(false);
      }
    });
  }

  private loadVehicleRegistrations(
    interventions: InterventionResponse[]
  ): void {

    const missingVehicleIds = Array.from(
      new Set(
        interventions
          .filter(
            (intervention) =>
              !intervention.immatriculationVehicule?.trim() &&
              intervention.vehiculeId > 0
          )
          .map(
            (intervention) => intervention.vehiculeId
          )
      )
    );

    if (missingVehicleIds.length === 0) {
      return;
    }

    this.vehiculeService
      .getAllVehicules({
        page: 0,
        size: 1000
      })
      .subscribe({

        next: (page: Page<VehiculeModel>) => {

          const registrationsByVehicleId = new Map(
            page.content.map(
              (vehicule) => [
                vehicule.id,
                vehicule.immatriculationFictive
              ]
            )
          );

          this.interventions.set(
            interventions.map((intervention) => ({
              ...intervention,

              immatriculationVehicule:
                intervention.immatriculationVehicule?.trim() ||
                registrationsByVehicleId.get(
                  intervention.vehiculeId
                ) ||
                '—'
            }))
          );
        },

        error: (error: unknown) => {

          console.error(
            'Failed to load vehicle registrations.',
            error
          );

          this.interventions.set(
            interventions.map((intervention) => ({
              ...intervention,

              immatriculationVehicule:
                intervention.immatriculationVehicule?.trim() ||
                '—'
            }))
          );

          this.registrationWarning.set(
            'Impossible de charger certaines immatriculations de véhicules.'
          );
        }
      });
  }

  onSearchChange(value: string): void {

    this.searchGlobale.set(value);
    console.log('onSearchChange', value);

    // Quand on lance une nouvelle recherche,
    // on revient à la première page.
    this.currentPage = 0;

    this.loadHistoriqueComplet();
  }

  onPageChange(nouvellePage: number): void {

    this.currentPage = nouvellePage;

    this.loadHistoriqueComplet();
  }

  retourListeInterventions(): void {

    void this.router.navigate([
      '/interventions'
    ]);
  }
}