import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  INTERVENTION_PRIORITIES,
  INTERVENTION_TYPES,
  type CreateInterventionRequest,
  type InterventionPriority,
  type InterventionType
} from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';
import { VehiculeService } from '../../vehicules/services/vehicule-service';
import { type VehiculeModel } from '../../vehicules/models/vehicule-model';

@Component({
  selector: 'app-intervention-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './intervention-form.html',
  styleUrl: './intervention-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly interventionService = inject(InterventionService);
  private readonly vehiculeService = inject(VehiculeService);

  readonly loading = signal(false);
  readonly loadingVehicules = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly vehiculeSearchErrorMessage = signal<string | null>(null);
  readonly vehicules = signal<VehiculeModel[]>([]);
  readonly selectedVehicule = signal<VehiculeModel | null>(null);
  readonly vehiculeDropdownOpen = signal(false);
  readonly vehiculeSearchTerm = signal('');
  protected readonly vehiculeSearch = this.fb.control('', { nonNullable: true });

  protected readonly interventionTypes = INTERVENTION_TYPES;
  protected readonly priorities = INTERVENTION_PRIORITIES;
  protected readonly minDate = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.nonNullable.group({
    vehiculeId: [0, [Validators.required, Validators.min(1)]],
    typeIntervention: ['DIAGNOSTIC' as InterventionType, [Validators.required]],
    descriptionClient: ['', [Validators.required, Validators.minLength(10)]],
    priorite: ['MOYENNE' as InterventionPriority, [Validators.required]],
    dateDepot: [this.minDate, [Validators.required]],
    dateRestitutionPrevue: [this.minDate, [Validators.required]]
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status
  });

  protected readonly hasVehiculeSelection = computed(
    () => this.form.controls.vehiculeId.value > 0 && this.selectedVehicule() !== null
  );

  protected readonly canSubmit = computed(
    () => this.formStatus() === 'VALID' && this.hasVehiculeSelection() && !this.loading()
  );

  ngOnInit(): void {
    this.vehiculeSearch.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((recherche) => this.onVehiculeSearchChange(recherche));

    const vehiculeIdParam = this.route.snapshot.queryParamMap.get('vehiculeId');
    if (vehiculeIdParam) {
      const id = Number(vehiculeIdParam);
      if (!Number.isNaN(id) && id > 0) {
        this.preselectVehicule(id);
      }
    }
  }

  protected selectVehicule(vehicule: VehiculeModel): void {
    this.selectedVehicule.set(vehicule);
    this.form.controls.vehiculeId.setValue(vehicule.id);
    this.vehiculeSearchErrorMessage.set(null);
  }

  protected clearVehiculeSelection(): void {
    this.selectedVehicule.set(null);
    this.form.controls.vehiculeId.setValue(0);
    this.vehiculeSearch.setValue('', { emitEvent: false });
    this.vehiculeSearchTerm.set('');
    this.vehicules.set([]);
    this.vehiculeDropdownOpen.set(false);
  }

  protected openVehiculeDropdown(): void {
    if (this.selectedVehicule()) {
      return;
    }

    const term = this.vehiculeSearch.value.trim();
    if (term.length === 0) {
      return;
    }

    this.vehiculeDropdownOpen.set(true);
    if (this.vehicules().length === 0) {
      this.loadVehicules(term);
    }
  }

  protected closeVehiculeDropdown(): void {
    this.vehiculeDropdownOpen.set(false);
  }

  protected selectVehiculeFromDropdown(vehicule: VehiculeModel, event: MouseEvent): void {
    event.preventDefault();
    this.selectVehicule(vehicule);
    this.vehiculeSearch.setValue(vehicule.immatriculationFictive, { emitEvent: false });
    this.vehiculeSearchTerm.set(vehicule.immatriculationFictive);
    this.vehicules.set([]);
    this.vehiculeDropdownOpen.set(false);
  }

  protected onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.hasVehiculeSelection()) {
      this.errorMessage.set('Veuillez sélectionner un véhicule avant de créer l’intervention.');
      return;
    }

    const raw = this.form.getRawValue();

    if (!raw.vehiculeId || raw.vehiculeId < 1) {
      this.errorMessage.set('Veuillez sélectionner un véhicule valide.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const payload: CreateInterventionRequest = {
      vehiculeId: raw.vehiculeId,
      typeIntervention: raw.typeIntervention,
      descriptionClient: raw.descriptionClient,
      priorite: raw.priorite,
      dateDepot: raw.dateDepot ? `${raw.dateDepot}T00:00:00` : raw.dateDepot,
      dateRestitutionPrevue: raw.dateRestitutionPrevue
        ? `${raw.dateRestitutionPrevue}T00:00:00`
        : raw.dateRestitutionPrevue,
    };

    this.interventionService.create(payload).subscribe({
      next: (created) => {
        this.loading.set(false);
        void this.router.navigate(['/interventions', created.id]);
      },
      error: (error: HttpErrorResponse) => {
        const status = error.status || 0;
        const backendMsg =
          this.getBackendErrorMessage(error.error) ??
          error.message ??
          'Impossible de créer l\'intervention.';
        console.error('Failed to create intervention.', {
          status,
          backendMsg,
          fullError: error,
          payloadSent: payload,
        });

        this.errorMessage.set(`Erreur ${status} : ${backendMsg}`);
        this.loading.set(false);
      }
    });
  }

  protected cancel(): void {
    void this.router.navigate(['/interventions']);
  }

  private loadVehicules(recherche = ''): void {
    this.loadingVehicules.set(true);
    this.vehiculeSearchErrorMessage.set(null);
    this.vehiculeService.getAllVehicules({ page: 0, size: 12, recherche }).subscribe({
      next: (page) => {
        this.vehicules.set(this.filterVehiculesByImmatriculation(page.content, recherche));
        this.loadingVehicules.set(false);
      },
      error: () => {
        this.loadingVehicules.set(false);
        this.vehiculeSearchErrorMessage.set('Impossible de rechercher les véhicules.');
      }
    });
  }

  private preselectVehicule(id: number): void {
    this.vehiculeService.getVehiculeById(id).subscribe({
      next: (vehicule) => {
        this.selectVehicule(vehicule);
        this.vehiculeSearch.setValue(vehicule.immatriculationFictive, { emitEvent: false });
        this.vehiculeSearchTerm.set(vehicule.immatriculationFictive);
        this.vehiculeDropdownOpen.set(false);
      },
      error: () => {
        this.errorMessage.set('Le véhicule pré-sélectionné est introuvable.');
      }
    });
  }

  private getBackendErrorMessage(errorBody: unknown): string | null {
    if (typeof errorBody === 'string') {
      return errorBody;
    }

    if (!this.isRecord(errorBody)) {
      return null;
    }

    const message = this.readStringField(errorBody, 'message');
    if (message) {
      return message;
    }

    const detail = this.readStringField(errorBody, 'detail');
    if (detail) {
      return detail;
    }

    return this.readStringField(errorBody, 'error');
  }

  private readStringField(source: Record<string, unknown>, key: string): string | null {
    const value = source[key];
    return typeof value === 'string' ? value : null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private onVehiculeSearchChange(recherche: string): void {
    const term = recherche.trim();
    this.vehiculeSearchTerm.set(term);
    this.vehiculeSearchErrorMessage.set(null);

    if (term.length === 0) {
      this.selectedVehicule.set(null);
      this.form.controls.vehiculeId.setValue(0);
      this.vehicules.set([]);
      this.loadingVehicules.set(false);
      this.vehiculeDropdownOpen.set(false);
      return;
    }

    const selected = this.selectedVehicule();
    if (
      selected &&
      selected.immatriculationFictive.trim().toLowerCase() !== term.toLowerCase()
    ) {
      this.selectedVehicule.set(null);
      this.form.controls.vehiculeId.setValue(0);
    }

    this.vehiculeDropdownOpen.set(true);
    this.loadVehicules(term);
  }

  private filterVehiculesByImmatriculation(
    vehicules: VehiculeModel[],
    recherche: string
  ): VehiculeModel[] {
    const normalizedSearch = this.normalizeSearchTerm(recherche);
    if (!normalizedSearch) {
      return vehicules;
    }

    const exactMatches = vehicules.filter((vehicule) => {
      return this.normalizeSearchTerm(vehicule.immatriculationFictive) === normalizedSearch;
    });

    if (exactMatches.length > 0) {
      return exactMatches;
    }

    return vehicules.filter((vehicule) => {
      return this.normalizeSearchTerm(vehicule.immatriculationFictive).includes(normalizedSearch);
    });
  }

  private normalizeSearchTerm(value: string): string {
    return value.trim().toLowerCase();
  }
}
