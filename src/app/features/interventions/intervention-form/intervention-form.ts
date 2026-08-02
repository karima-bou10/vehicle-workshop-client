import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
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

  protected readonly canSubmit = computed(
    () => this.formStatus() === 'VALID' && !this.loading()
  );

  ngOnInit(): void {
    this.vehiculeService.getAllVehicules({ page: 0, size: 1000 }).subscribe({
      next: (page) => this.vehicules.set(page.content),
      error: () => this.errorMessage.set('Impossible de charger la liste des véhicules.')
    });

    const vehiculeIdParam = this.route.snapshot.queryParamMap.get('vehiculeId');
    if (vehiculeIdParam) {
      const id = Number(vehiculeIdParam);
      if (!Number.isNaN(id) && id > 0) {
        this.form.controls.vehiculeId.setValue(id);
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
    if (!raw.vehiculeId || raw.vehiculeId < 1) {
      this.errorMessage.set('Veuillez renseigner un identifiant de véhicule valide.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const payload: CreateInterventionRequest = {
      ...raw,
      vehiculeId: Number(raw.vehiculeId),
      dateDepot: raw.dateDepot ? `${raw.dateDepot}T00:00:00` : raw.dateDepot,
      dateRestitutionPrevue: raw.dateRestitutionPrevue
        ? `${raw.dateRestitutionPrevue}T00:00:00`
        : raw.dateRestitutionPrevue,
    };

    // 🔍 DEBUG — visible dans F12 > Console
    console.log('📤 Payload envoyé au backend :', JSON.stringify(payload, null, 2));

    this.interventionService.create(payload).subscribe({
      next: (created) => {
        this.loading.set(false);
        void this.router.navigate(['/interventions', created.id]);
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
}
