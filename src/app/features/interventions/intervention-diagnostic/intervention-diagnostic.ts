import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InterventionResponse } from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';

@Component({
  selector: 'app-intervention-diagnostic',
  imports: [ReactiveFormsModule],
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

  protected readonly form = this.fb.nonNullable.group({
    diagnostic: ['', [Validators.required, Validators.minLength(5)]],
    coutEstime: [0, [Validators.required, Validators.min(0.01)]],
    auteur: ['', [Validators.required, Validators.minLength(2)]],
    commentaire: ['']
  });

  protected readonly canSave = computed(() => this.form.valid && !this.saving());

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
          diagnostic: response.diagnostic ?? '',
          coutEstime: response.coutEstime ?? 0
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
    this.executeSave(false);
  }

  protected enregistrerEtPasserDevis(): void {
    this.executeSave(true);
  }

  protected retourDetail(): void {
    const interventionId = this.intervention()?.id;
    if (interventionId) {
      void this.router.navigate(['/interventions', interventionId]);
      return;
    }

    void this.router.navigate(['/interventions']);
  }

  private executeSave(moveToDevis: boolean): void {
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
        diagnostic: payload.diagnostic,
        coutEstime: payload.coutEstime,
        auteur: payload.auteur,
        commentaire: payload.commentaire || undefined
      })
      .subscribe({
        next: (updated) => {
          if (!moveToDevis) {
            this.intervention.set(updated);
            this.saving.set(false);
            return;
          }

          this.interventionService
            .updateStatus(updated.id, {
              nouveauStatut: 'DEVIS_A_VALIDER',
              auteur: payload.auteur,
              commentaire: payload.commentaire || 'Passage en devis après diagnostic.'
            })
            .subscribe({
              next: (statusUpdated) => {
                this.intervention.set(statusUpdated);
                this.saving.set(false);
                void this.router.navigate(['/interventions', statusUpdated.id]);
              },
              error: (error: unknown) => {
                console.error('Failed to move intervention to devis.', error);
                this.errorMessage.set('Diagnostic enregistré mais transition vers Devis à valider refusée.');
                this.saving.set(false);
              }
            });
        },
        error: (error: unknown) => {
          console.error('Failed to save diagnostic.', error);
          this.errorMessage.set('Impossible de sauvegarder le diagnostic.');
          this.saving.set(false);
        }
      });
  }
}
