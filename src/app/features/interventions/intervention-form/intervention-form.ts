import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  INTERVENTION_PRIORITIES,
  INTERVENTION_TYPES,
  type CreateInterventionRequest,
  type InterventionPriority,
  type InterventionType
} from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';

@Component({
  selector: 'app-intervention-form',
  imports: [ReactiveFormsModule],
  templateUrl: './intervention-form.html',
  styleUrl: './intervention-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionForm {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly interventionService = inject(InterventionService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  protected readonly interventionTypes = INTERVENTION_TYPES;
  protected readonly priorities = INTERVENTION_PRIORITIES;
  protected readonly minDate = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.nonNullable.group({
    vehiculeId: [0, [Validators.required, Validators.min(1)]],
    typeIntervention: ['DIAGNOSTIC' as InterventionType, [Validators.required]],
    descriptionClient: ['', [Validators.required, Validators.minLength(10)]],
    priorite: ['NORMALE' as InterventionPriority, [Validators.required]],
    dateDepot: [this.minDate, [Validators.required]],
    dateRestitutionPrevue: [this.minDate, [Validators.required]]
  });

  protected readonly canSubmit = computed(() => this.form.valid && !this.loading());

  protected onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    const payload: CreateInterventionRequest = this.form.getRawValue();

    this.interventionService.create(payload).subscribe({
      next: (created) => {
        this.loading.set(false);
        void this.router.navigate(['/interventions', created.id]);
      },
      error: (error: unknown) => {
        console.error('Failed to create intervention.', error);
        this.errorMessage.set('Impossible de créer l intervention.');
        this.loading.set(false);
      }
    });
  }

  protected cancel(): void {
    void this.router.navigate(['/interventions']);
  }
}
