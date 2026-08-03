import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { InterventionResponse } from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { AuthService } from '../../../core/services/auth-service';
import { MecanicienService } from '../../mecaniciens/services/mecanicien-service';
import { MecanicienResponse } from '../../mecaniciens/models/mecanicien.model';

@Component({
  selector: 'app-intervention-affectation',
  imports: [ReactiveFormsModule, LoadingSpinner],
  templateUrl: './intervention-affectation.html',
  styleUrl: './intervention-affectation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionAffectation implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly interventionService = inject(InterventionService);
  private readonly mecanicienService = inject(MecanicienService);
  private readonly auth = inject(AuthService);

  readonly intervention = signal<InterventionResponse | null>(null);
  readonly mecaniciens = signal<MecanicienResponse[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    mecanicienId: [0, [Validators.required, Validators.min(1)]]
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status
  });

  protected readonly canSave = computed(
    () => this.formStatus() === 'VALID' && !this.saving()
  );

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const interventionId = Number(idParam);

    if (!idParam || Number.isNaN(interventionId)) {
      this.errorMessage.set("Identifiant d'intervention invalide.");
      this.loading.set(false);
      return;
    }

    // Charger intervention et mécaniciens disponibles en parallèle
    this.interventionService.getById(interventionId).subscribe({
      next: (response) => {
        this.intervention.set(response);
        this.form.patchValue({
          mecanicienId: response.mecanicienId ?? 0
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load intervention for assignment.', error);
        this.errorMessage.set("Impossible de charger l'intervention.");
        this.loading.set(false);
      }
    });

    this.mecanicienService.getMecaniciensDisponibles().subscribe({
      next: (response) => {
        this.mecaniciens.set(response);
      },
      error: (error: unknown) => {
        console.error('Failed to load available mechanics.', error);
        this.errorMessage.set("Impossible de charger les mécaniciens disponibles.");
      }
    });
  }

  protected affecter(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Le formulaire est invalide.');
      return;
    }

    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return;
    }

    const payload = this.form.getRawValue();

    if (!payload.mecanicienId || payload.mecanicienId < 1) {
      this.errorMessage.set('Veuillez sélectionner un mécanicien valide.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.interventionService
      .updateAffectation(currentIntervention.id, {
        mecanicienId: Number(payload.mecanicienId)
      })
      .subscribe({
        next: (updated) => {
          this.intervention.set(updated);
          this.saving.set(false);
          void this.router.navigate(['/interventions', updated.id]);
        },
        error: (error: unknown) => {
          console.error('Failed to save assignment.', error);
          this.errorMessage.set("Impossible d'enregistrer l'affectation.");
          this.saving.set(false);
        }
      });
  }

  protected retourDetail(): void {
    const interventionId = this.intervention()?.id;
    if (interventionId) {
      void this.router.navigate(['/interventions', interventionId]);
      return;
    }

    void this.router.navigate(['/interventions']);
  }
}
