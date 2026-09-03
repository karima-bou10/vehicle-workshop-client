import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe,NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InterventionService } from '../services/intervention-service';
import { InterventionResponse } from '../models/intervention.model';
import { VehiculeService } from '../../vehicules/services/vehicule-service';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { PaginatedTable, TableColumn } from '../../../shared/ui/paginated-table/paginated-table';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { Page } from '../../../core/models/page';
import { VehiculeModel } from '../../vehicules/models/vehicule-model';
import { HasRole } from '../../../shared/directives/has-role';


@Component({
  selector: 'app-intervention-list',
  imports: [DatePipe, StatusTag, PaginatedTable, LoadingSpinner,HasRole],
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
  readonly selectedTypeIntervention = signal('');
  readonly selectedPrioriteIntervention = signal('');
  


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

  readonly colonnes: TableColumn[] = [
    { key: 'nom', label: 'Mécanicien' },
    { key: 'specialite', label: 'Spécialité' },
    { key: 'etat', label: 'État', width: '120px' },
    { key: 'interventions', label: 'Interventions', width: '130px', align: 'center' },
    { key: 'actions', label: '', width: '90px', align: 'right' },
  ];


  showDeleteModal = false;
  interventionIdToDelete: number | null = null;


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
    .filter((intervention) => intervention.mecanicienId !== null)
    .map((intervention) => ({
      id: intervention.mecanicienId!,
      nom: `${intervention.nomMecanicien ?? ''} ${intervention.prenomMecanicien ?? ''}`.trim()
    }));

  return Array.from(
    new Map(values.map((mecanicien) => [mecanicien.id, mecanicien])).values()
  ).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
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
    { key: '_actions',               label: 'Actions',              width: '120px' },
  ];

  ngOnInit(): void {
    this.loadInterventions();
  }

  
private loadInterventions(): void {
  this.loading.set(true);
  this.errorMessage.set(null);
  this.registrationWarning.set(null);

  const filtre = this.route.snapshot.queryParamMap.get('filtre');

  this.modeRetards.set(filtre === 'retards');

  // Cas : interventions en retard
  if (filtre === 'retards') {
    this.interventionService
      .getInterventionsEnRetard(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: Page<InterventionResponse>) => {
          this.page.set(response);
          this.interventions.set(response.content);
          this.loading.set(false);

          this.loadVehicleRegistrations(response.content);
        },
        error: (error: unknown) => {
          console.error(error);
          this.errorMessage.set(
            'Impossible de charger les interventions.'
          );
          this.loading.set(false);
        }
      });

    return;
  }

  // Filtres de recherche
  const params = {
    reference: this.searchGlobale(),
    immatriculation: this.selectedVehicule(),
    statut: this.selectedStatut(),
    typeIntervention: this.selectedTypeIntervention(),
    priorite: this.selectedPrioriteIntervention(),
    mecanicienId: this.selectedMecanicien()
      ? Number(this.selectedMecanicien())
      : undefined
  };

  // Vérifier s'il y a au moins un filtre
  const hasSearch =
    !!params.reference?.trim() ||
    !!params.immatriculation?.trim() ||
    !!params.typeIntervention?.trim() ||
    !!params.statut?.trim() ||
    !!params.priorite?.trim() ||

    params.mecanicienId !== undefined;

  // Recherche backend ou récupération normale
  const source$ = hasSearch
    ? this.interventionService.search(
        params,
        this.currentPage,
        this.pageSize
      )
    : this.interventionService.getAll(
        this.currentPage,
        this.pageSize
      );

  source$.subscribe({
    next: (response: Page<InterventionResponse>) => {
      this.page.set(response);
      this.interventions.set(response.content);
      this.loading.set(false);

      this.loadVehicleRegistrations(response.content);
    },
    error: (error: unknown) => {
      console.error(
        'Failed to load interventions.',
        error
      );

      this.errorMessage.set(
        'Impossible de charger les interventions.'
      );

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
      ...this.interventions().map((intervention) =>
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
  this.selectedTypeIntervention.set('');
  this.selectedPrioriteIntervention.set('');

  this.currentPage = 0;

  this.loadInterventions();
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

  peutModifier(intervention: InterventionResponse): boolean {
  return (
    intervention.statut === 'RECUE' ||
    intervention.statut === 'DIAGNOSTIC_EN_COURS'
  );
  }

  peutArchiver(intervention: InterventionResponse): boolean {
  return intervention.statut === 'TERMINEE'
      || intervention.statut === 'RESTITUEE'
      || intervention.statut === 'ANNULEE';
}
  
supprimerIntervention(id: number): void {
  this.interventionIdToDelete = id;
  this.showDeleteModal = true;
  }
  annulerSuppression(): void {
  this.showDeleteModal = false;
  this.interventionIdToDelete = null;
}

confirmerSuppression(): void {
  if (!this.interventionIdToDelete) {
    return;
  }

  this.interventionService
    .deleteIntervention(this.interventionIdToDelete)
    .subscribe({
      next: () => {
        this.loadInterventions();
        this.showDeleteModal = false;
        this.interventionIdToDelete = null;
      },
      error: (err) => {
        console.error(err);
        this.showDeleteModal = false;
      }
    });
  }
onSearchChange(value: string): void {
  this.searchGlobale.set(value);
  this.currentPage = 0;
  this.loadInterventions();
}

onStatutChange(value: string): void {
  this.selectedStatut.set(value);
  this.currentPage = 0;
  this.loadInterventions();
}

  onVehiculeChange(value: string): void {
    console.log('vehicule', value);
  this.selectedVehicule.set(value);
  this.currentPage = 0;
  this.loadInterventions();
}

onMecanicienChange(value: string): void {
  this.selectedMecanicien.set(value);
  this.currentPage = 0;
  this.loadInterventions();
  }
  onTypeInterventionChange(value: string): void {
  this.selectedTypeIntervention.set(value);
  this.currentPage = 0;
  this.loadInterventions();
  }
  onPrioriteInterventionChange(value: string): void{
    this.selectedPrioriteIntervention.set(value);
    this.currentPage = 0;
    this.loadInterventions();
  }
onPageChange(nouvellePage: number): void {
  this.currentPage = nouvellePage;
  this.loadInterventions();
}
}