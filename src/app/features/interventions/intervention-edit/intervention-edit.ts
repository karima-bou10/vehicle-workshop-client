import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  INTERVENTION_PRIORITIES,
  INTERVENTION_TYPES,
  type InterventionPriority,
  type InterventionResponse,
  type InterventionType,
  type UpdateInterventionRequest
} from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { normalizeInterventionStatus } from '../models/intervention-workflow';

@Component({
  selector: 'app-intervention-edit',
  imports: [ReactiveFormsModule, LoadingSpinner],
  templateUrl: './intervention-edit.html',
  styleUrl: './intervention-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionEdit implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly interventionService = inject(InterventionService);

  readonly intervention = signal<InterventionResponse | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  protected readonly interventionTypes = INTERVENTION_TYPES;
  protected readonly priorities = INTERVENTION_PRIORITIES;

  protected readonly form = this.fb.nonNullable.group({
    typeIntervention: ['DIAGNOSTIC' as InterventionType, [Validators.required]],
    descriptionClient: ['', [Validators.required, Validators.minLength(10)]],
    priorite: ['MOYENNE' as InterventionPriority, [Validators.required]],
    dateRestitutionPrevue: ['', [Validators.required]]
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status
  });

  protected readonly isReadOnly = computed(() => {
    const statut = normalizeInterventionStatus(this.intervention()?.statut);
    return statut !== 'RECUE' && statut !== 'DIAGNOSTIC_EN_COURS';
  });

  protected readonly canSave = computed(
    () => this.formStatus() === 'VALID' && !this.saving() && !this.isReadOnly()
  );

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const interventionId = Number(idParam);

    if (!idParam || Number.isNaN(interventionId)) {
      this.errorMessage.set("Identifiant d'intervention invalide.");
      this.loading.set(false);
      return;
    }

    this.interventionService.getById(interventionId).subscribe({
      next: (response) => {
        this.intervention.set(response);
        this.form.patchValue({
          typeIntervention: response.typeIntervention as InterventionType,
          descriptionClient: response.descriptionClient,
          priorite: response.priorite as InterventionPriority,
          dateRestitutionPrevue: response.dateRestitutionPrevue?.slice(0, 10) ?? ''
        });
        if (this.isReadOnly()) {
          this.form.disable();
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load intervention for edit.', error);
        this.errorMessage.set("Impossible de charger l'intervention.");
        this.loading.set(false);
      }
    });
  }

  protected enregistrer(): void {
    if (!this.form.valid || this.isReadOnly()) {
      this.form.markAllAsTouched();
      return;
    }

    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    const raw = this.form.getRawValue();

    const payload: UpdateInterventionRequest = {
      typeIntervention: raw.typeIntervention,
      descriptionClient: raw.descriptionClient,
      priorite: raw.priorite,
      dateRestitutionPrevue: raw.dateRestitutionPrevue ? `${raw.dateRestitutionPrevue}T00:00:00` : raw.dateRestitutionPrevue
    };

    this.interventionService.updateIntervention(currentIntervention.id, payload).subscribe({
      next: (updated) => {
        this.saving.set(false);
        void this.router.navigate(['/interventions', updated.id]);
      },
      error: (error: unknown) => {
        console.error('Failed to update intervention.', error);
        const backendMsg = this.extractErrorMessage(error);
        this.errorMessage.set(backendMsg ?? "Impossible de mettre à jour l'intervention.");
        this.saving.set(false);
      }
    });
  }

  protected retourDetail(): void {
    const id = this.intervention()?.id;
    void this.router.navigate(id ? ['/interventions', id] : ['/interventions']);
  }

  private extractErrorMessage(error: unknown): string | null {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      if (typeof body === 'string') return body;
      if (body && typeof body === 'object') {
        const rec = body as Record<string, unknown>;
        return (rec['message'] ?? rec['detail'] ?? rec['error'] ?? null) as string | null;
      }
    }
    return null;
  }
}
