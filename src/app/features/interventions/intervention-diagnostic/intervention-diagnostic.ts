import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { InterventionResponse } from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';

@Component({
  selector: 'app-intervention-diagnostic',
  imports: [ReactiveFormsModule, LoadingSpinner],
  templateUrl: './intervention-diagnostic.html',
  styleUrl: './intervention-diagnostic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionDiagnostic implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly interventionService = inject(InterventionService);

  readonly intervention = signal<InterventionResponse | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showConfirmation = signal(false);
  readonly diagnosticInitial = signal('');
  protected readonly form = this.fb.nonNullable.group({
    diagnostic: ['', [Validators.required, Validators.minLength(5)]]
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status
  });
 readonly diagnostic = toSignal(
  this.form.controls.diagnostic.valueChanges,
  {
    initialValue: this.form.controls.diagnostic.value
  }
);

protected readonly canSave = computed(() => {
  const valeurActuelle = this.diagnostic().trim();
  const valeurInitiale = this.diagnosticInitial().trim();

  return (
    this.formStatus() === 'VALID' &&
    valeurActuelle !== valeurInitiale &&
    !this.saving()
  );
});

  protected readonly isModification = computed(() => {
  const diagnostic = this.intervention()?.diagnostic;
  return !!diagnostic && diagnostic.trim().length > 0;
});

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
        const diagnostic = response.diagnostic ?? '';
        this.diagnosticInitial.set(diagnostic);
        this.form.patchValue({
          diagnostic: diagnostic,
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load intervention for diagnostic.', error);
        this.errorMessage.set("Impossible de charger l'intervention.");
        this.loading.set(false);
      }
    });
  }

  protected enregistrerDiagnostic(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    this.showConfirmation.set(true);
  }

      protected confirmerDiagnostic(): void {
      this.showConfirmation.set(false);
      this.executeSave();
    }

    protected annulerConfirmation(): void {
      this.showConfirmation.set(false);
    }

  protected retourDetail(): void {
    const interventionId = this.intervention()?.id;
    if (interventionId) {
      void this.router.navigate(['/interventions', interventionId]);
      return;
    }

    void this.router.navigate(['/interventions']);
  }

  private executeSave(): void {
    if (!this.form.valid || !this.intervention()) {
      this.form.markAllAsTouched();
      return;
    }

    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    const payload = this.form.getRawValue();

    this.interventionService
      .updateDiagnostic(currentIntervention.id, {
        diagnostic: payload.diagnostic
      })
      .subscribe({
        next: (updated) => {
          this.intervention.set(updated);
          this.saving.set(false);
          void this.router.navigate(['/interventions', updated.id]);
        },
        error: (error: unknown) => {
          console.error('Failed to save diagnostic.', error);
          this.errorMessage.set('Impossible de sauvegarder le diagnostic.');
          this.saving.set(false);
        }
      });
  }
}
