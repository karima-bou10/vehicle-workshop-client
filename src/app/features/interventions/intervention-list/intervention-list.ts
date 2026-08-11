import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);

  readonly interventions = signal<InterventionResponse[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly registrationWarning = signal<string | null>(null);
  readonly modeRetards = signal(false);
  readonly searchGlobale = signal('');
  readonly selectedVehicule = signal('');
  readonly selectedStatut = signal('');
  readonly selectedMecanicien = signal('');

  readonly vehiculeOptions = computed(() => {
    const values = this.interventions()
      .map((intervention) => intervention.immatriculationVehicule?.trim())
      .filter((value): value is string => Boolean(value) && value !== '—');

    return [''].concat(Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'fr')));
  });

  readonly vehiculeSuggestions = computed(() => {
    const query = this.selectedVehicule().trim().toLowerCase();
    const values = this.vehiculeOptions().filter((value) => value);

    if (query.length < 2) {
      return values;
    }

    return values.filter((value) => value.toLowerCase().startsWith(query));
  });

  readonly statutOptions = computed(() => {
    const values = this.interventions()
      .map((intervention) => intervention.statut?.trim())
      .filter((value): value is string => Boolean(value));

    return [''].concat(Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'fr')));
  });

  readonly mecanicienOptions = computed(() => {
    const values = this.interventions()
      .map((intervention) => intervention.nomMecanicien?.trim())
      .filter((value): value is string => Boolean(value) && value !== '—');

    return [''].concat(Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'fr')));
  });

  readonly filteredInterventions = computed(() => {
    const rechercheGlobale = this.searchGlobale().trim().toLowerCase();
    const vehicule = this.selectedVehicule().trim().toLowerCase();
    const statut = this.selectedStatut().toLowerCase();
    const mecanicien = this.selectedMecanicien().toLowerCase();

    return this.interventions().filter((intervention) => {
      const texteRecherche = [
        intervention.reference,
        intervention.typeIntervention,
        intervention.statut,
        intervention.priorite,
        intervention.immatriculationVehicule,
        intervention.nomMecanicien,
        intervention.dateDepot,
        intervention.coutEstime,
        intervention.deleted ? 'supprimée' : 'non'
      ]
        .map((value) => (value === null || value === undefined ? '' : String(value).toLowerCase()))
        .join(' ');
      const interventionVehicule = (intervention.immatriculationVehicule ?? '').toLowerCase();
      const interventionStatut = (intervention.statut ?? '').toLowerCase();
      const interventionMecanicien = (intervention.nomMecanicien ?? '').toLowerCase();
      const vehiculeMatches = vehicule.length < 2 || interventionVehicule.startsWith(vehicule);

      return (
        (!rechercheGlobale || texteRecherche.includes(rechercheGlobale)) &&
        vehiculeMatches &&
        (!statut || interventionStatut === statut) &&
        (!mecanicien || interventionMecanicien.includes(mecanicien))
      );
    });
  });

  readonly columns: TableColumn[] = [
    { key: 'id',                     label: 'reference',             width: '60px' },
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
    const filtre = this.route.snapshot.queryParamMap.get('filtre');
    const source$ = filtre === 'retards'
      ? this.interventionService.getInterventionsEnRetard()
      : this.interventionService.getAll();

    this.modeRetards.set(filtre === 'retards');

    source$.subscribe({
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

  creerIntervention(): void {
    void this.router.navigate(['/interventions/new']);
  }

  exporterCsv(): void {
    const colonnes = [
      'reference',
      'typeIntervention',
      'statut',
      'priorite',
      'immatriculationVehicule',
      'nomMecanicien',
      'dateDepot',
      'coutEstime',
      'deleted'
    ];

    const toCsvValue = (value: unknown): string => {
      const texte = value === null || value === undefined ? '-' : String(value).trim() || '-';
      return `"${texte.replaceAll('"', '""')}"`;
    };

    const lignes = [
      '\ufeff' + colonnes.join(';'),
      ...this.filteredInterventions().map((intervention) =>
        [
          intervention.reference ?? intervention.id,
          intervention.typeIntervention,
          intervention.statut,
          intervention.priorite,
          intervention.immatriculationVehicule,
          intervention.nomMecanicien,
          intervention.dateDepot,
          intervention.coutEstime ?? '',
          intervention.deleted ? 'Supprimée' : 'Non'
        ]
          .map(toCsvValue)
          .join(';')
      )
    ].join('\r\n');

    const fichier = new Blob([lignes], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(fichier);
    const lien = document.createElement('a');

    lien.href = url;
    lien.download = `interventions-${new Date().toISOString().slice(0, 10)}.csv`;
    lien.click();

    URL.revokeObjectURL(url);
  }

  voirHistoriqueComplet(): void {
    void this.router.navigate(['/interventions/historique']);
  }

  reinitialiserFiltres(): void {
    this.searchGlobale.set('');
    this.selectedVehicule.set('');
    this.selectedStatut.set('');
    this.selectedMecanicien.set('');
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

  allerEdition(id: number): void {
    void this.router.navigate(['/interventions', id, 'edit']);
  }

  voirHistorique(id: number): void {
    void this.router.navigate(['/interventions', id, 'historique']);
  }

  modifierIntervention(id: number): void {

    void this.router.navigate(['/interventions', id, 'edit']);

  }

  supprimerIntervention(id: number): void {
  if (confirm('Voulez-vous vraiment supprimer cette intervention ?')) {
    this.interventionService.deleteIntervention(id).subscribe({
      next: () => {
        this.loadInterventions();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
}