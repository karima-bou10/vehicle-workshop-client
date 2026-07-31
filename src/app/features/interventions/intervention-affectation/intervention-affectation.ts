import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InterventionResponse } from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';

@Component({
  selector: 'app-intervention-affectation',
  imports: [ReactiveFormsModule],
  templateUrl: './intervention-affectation.html',
  styleUrl: './intervention-affectation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionAffectation implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly interventionService = inject(InterventionService);

  readonly intervention = signal<InterventionResponse | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    mecanicienId: [0, [Validators.required, Validators.min(1)]],
    nomMecanicien: ['', [Validators.required, Validators.minLength(2)]],
    specialite: ['', [Validators.required, Validators.minLength(2)]],
    disponible: [true, [Validators.required]],
    auteur: ['', [Validators.required, Validators.minLength(2)]],
    commentaire: ['']
  });

  protected readonly canSave = computed(() => this.form.valid && this.form.controls.disponible.value && !this.saving());

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
          mecanicienId: response.mecanicienId ?? 0,
          nomMecanicien: response.nomMecanicien ?? ''
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load intervention for assignment.', error);
        this.errorMessage.set("Impossible de charger l'intervention.");
        this.loading.set(false);
      }
    });
  }

  protected affecter(): void {
    this.executeSave(false);
  }

  protected affecterEtPasserReparation(): void {
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

  private executeSave(moveToRepair: boolean): void {
    if (!this.form.valid || !this.form.controls.disponible.value) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Le mécanicien doit être disponible avant affectation.');
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
      .updateAffectation(currentIntervention.id, {
        mecanicienId: payload.mecanicienId,
        nomMecanicien: payload.nomMecanicien,
        specialite: payload.specialite,
        disponible: payload.disponible,
        auteur: payload.auteur,
        commentaire: payload.commentaire || undefined
      })
      .subscribe({
        next: (updated) => {
          if (!moveToRepair) {
            this.intervention.set(updated);
            this.saving.set(false);
            return;
          }

          this.interventionService
            .updateStatus(updated.id, {
              nouveauStatut: 'EN_REPARATION',
              auteur: payload.auteur,
              commentaire: payload.commentaire || 'Passage en réparation après affectation.'
            })
            .subscribe({
              next: (statusUpdated) => {
                this.intervention.set(statusUpdated);
                this.saving.set(false);
                void this.router.navigate(['/interventions', statusUpdated.id]);
              },
              error: (error: unknown) => {
                console.error('Failed to move intervention to repair.', error);
                this.errorMessage.set('Affectation enregistrée mais transition vers En réparation refusée.');
                this.saving.set(false);
              }
            });
        },
        error: (error: unknown) => {
          console.error('Failed to save assignment.', error);
          this.errorMessage.set("Impossible d'enregistrer l affectation.");
          this.saving.set(false);
        }
      });
  }
}
