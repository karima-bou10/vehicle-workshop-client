import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  INTERVENTION_PRIORITIES,
  INTERVENTION_TYPES,
  type CreateInterventionRequest,
  type InterventionPriority,
  type InterventionType,
  type UpdateInterventionRequest
} from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';
import { VehiculeService } from '../../vehicules/services/vehicule-service';
import { type VehiculeModel } from '../../vehicules/models/vehicule-model';

@Component({
  selector: 'app-intervention-form',
  imports: [ReactiveFormsModule],
  templateUrl: './intervention-form.html',
  styleUrl: './intervention-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly interventionService = inject(InterventionService);
  private readonly vehiculeService = inject(VehiculeService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly vehicules = signal<VehiculeModel[]>([]);
  readonly isEditMode = signal(false);
  readonly interventionId = signal<number | null>(null);
  readonly dateCloture = signal<string | null>(null);

  protected readonly interventionTypes = INTERVENTION_TYPES;
  protected readonly priorities = INTERVENTION_PRIORITIES;
  protected readonly minDate = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.nonNullable.group({
    vehiculeId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    typeIntervention: ['DIAGNOSTIC' as InterventionType, [Validators.required]],
    descriptionClient: ['', [Validators.required, Validators.minLength(10)]],
    priorite: ['MOYENNE' as InterventionPriority, [Validators.required]],
    dateDepot: [this.minDate, [Validators.required]],
    dateRestitutionPrevue: [this.minDate, [Validators.required]]
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status
  });

  protected readonly canSubmit = computed(
    () => this.formStatus() === 'VALID' && !this.loading()
  );

  protected readonly formTitle = computed(() =>
    this.isEditMode() ? "Modifier l'intervention" : 'Nouvelle intervention'
  );

  protected readonly formSubtitle = computed(() =>
    this.isEditMode()
      ? "Mettre à jour les informations de l'intervention."
      : "Renseigner les informations de l'intervention."
  );

  protected readonly submitLabel = computed(() => {
    if (this.loading()) {
      return this.isEditMode() ? 'Enregistrement…' : 'Création…';
    }
    return this.isEditMode() ? 'Enregistrer les modifications' : "Créer l'intervention";
  });

  ngOnInit(): void {
    this.vehiculeService.getAllVehicules({ page: 0, size: 1000 }).subscribe({
      next: (page) => this.vehicules.set(page.content),
      error: () => this.errorMessage.set('Impossible de charger la liste des véhicules.')
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const interventionId = Number(idParam);
    if (idParam && !Number.isNaN(interventionId) && interventionId > 0) {
      this.isEditMode.set(true);
      this.interventionId.set(interventionId);
      this.loadInterventionForEdit(interventionId);
      return;
    }

    const vehiculeIdParam = this.route.snapshot.queryParamMap.get('vehiculeId');
    if (vehiculeIdParam) {
      const id = Number(vehiculeIdParam);
      if (!Number.isNaN(id) && id > 0) {
        this.form.controls.vehiculeId.setValue(vehiculeIdParam);
      }
    }
  }

  protected onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    // Defensive guard: vehiculeId must be a valid positive integer
    const vehiculeId = Number(raw.vehiculeId);
    if (Number.isNaN(vehiculeId) || vehiculeId < 1) {
      this.errorMessage.set('Veuillez sélectionner un véhicule valide.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const createPayload: CreateInterventionRequest = {
      ...raw,
      vehiculeId: vehiculeId,
      dateDepot: raw.dateDepot ? `${raw.dateDepot}T00:00:00` : raw.dateDepot,
      dateRestitutionPrevue: raw.dateRestitutionPrevue
        ? `${raw.dateRestitutionPrevue}T00:00:00`
        : raw.dateRestitutionPrevue,
    };

    const editId = this.interventionId();
    const updatePayload: UpdateInterventionRequest = {
      typeIntervention: raw.typeIntervention,
      descriptionClient: raw.descriptionClient,
      priorite: raw.priorite,
      dateRestitutionPrevue: raw.dateRestitutionPrevue
        ? `${raw.dateRestitutionPrevue}T00:00:00`
        : raw.dateRestitutionPrevue,
      dateCloture: this.dateCloture()
    };
    const saveRequest = this.isEditMode() && editId
      ? this.interventionService.updateIntervention(editId, updatePayload)
      : this.interventionService.create(createPayload);

    saveRequest.subscribe({
      next: (saved) => {
        this.loading.set(false);
        void this.router.navigate(['/interventions', saved.id]);
      },
      error: (error: unknown) => {
        // HttpErrorResponse n'est pas un instanceof Error — on cast directement
        const httpErr = error as any;
        const status: number = httpErr?.['status'] ?? 0;
        const backendBody = httpErr?.['error'];
        const backendMsg: string =
          backendBody?.['message'] ??
          backendBody?.['detail'] ??
          backendBody?.['error'] ??
          (typeof backendBody === 'string' ? backendBody : null) ??
          httpErr?.['message'] ??
          'Impossible de créer l\'intervention.';

        console.error('Failed to create intervention.', {
          status,
          backendMsg,
          fullError: error,
          payloadSent: this.isEditMode() ? updatePayload : createPayload,
        });

        this.errorMessage.set(`Erreur ${status} : ${backendMsg}`);
        this.loading.set(false);
      }
    });
  }

  private loadInterventionForEdit(id: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.interventionService.getById(id).subscribe({
      next: (intervention) => {
        this.dateCloture.set(intervention.dateCloture);
        this.form.patchValue({
          vehiculeId: String(intervention.vehiculeId),
          typeIntervention: intervention.typeIntervention as InterventionType,
          descriptionClient: intervention.descriptionClient,
          priorite: intervention.priorite as InterventionPriority,
          dateDepot: intervention.dateDepot.split('T')[0],
          dateRestitutionPrevue: intervention.dateRestitutionPrevue.split('T')[0]
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load intervention for edit.', error);
        this.errorMessage.set("Impossible de charger l'intervention à modifier.");
        this.loading.set(false);
      }
    });
  }

  protected cancel(): void {
    void this.router.navigate(['/interventions']);
  }
}
