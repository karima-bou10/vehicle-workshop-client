import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { InterventionResponse } from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';

@Component({
  selector: 'app-intervention-devis',
  imports: [ReactiveFormsModule, LoadingSpinner],
  templateUrl: './intervention-devis.html',
  styleUrl: './intervention-devis.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionDevis implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly interventionService = inject(InterventionService);

  readonly intervention = signal<InterventionResponse | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly dateMinRestitution = signal('');

  // Ajout : popup de confirmation
  readonly showConfirmation = signal(false);

  // Ajout : valeurs initiales pour détecter une modification
  readonly coutEstimeInitial = signal(0);
  readonly dateRestitutionPrevueInitiale = signal('');

  protected readonly form = this.fb.nonNullable.group({
    coutEstime: [0, [Validators.required, Validators.min(1)]],
    dateRestitutionPrevue: ['', Validators.required]
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status
  });

  // Ajout : valeurs réactives du formulaire
  readonly coutEstime = toSignal(
    this.form.controls.coutEstime.valueChanges,
    { initialValue: this.form.controls.coutEstime.value }
  );

  readonly dateRestitutionPrevue = toSignal(
    this.form.controls.dateRestitutionPrevue.valueChanges,
    { initialValue: this.form.controls.dateRestitutionPrevue.value }
  );

  protected readonly hasDiagnostic = computed(
    () => (this.intervention()?.diagnostic?.trim().length ?? 0) > 0
  );

  // Détermine si un devis existe déjà
  protected readonly isModification = computed(() => {
    const intervention = this.intervention();

    return intervention?.coutEstime !== null &&
           intervention?.coutEstime !== undefined;
  });

  // Autorise l'enregistrement uniquement si :
  // - formulaire valide
  // - diagnostic présent
  // - pas déjà en sauvegarde
  // - ou bien une vraie modification a été faite
  protected readonly canSave = computed(() => {
    const coutModifie =
      Number(this.coutEstime()) !== this.coutEstimeInitial();

    const dateModifiee =
      this.dateRestitutionPrevue() !==
      this.dateRestitutionPrevueInitiale();

    return (
      this.formStatus() === 'VALID' &&
      this.hasDiagnostic() &&
      !this.saving() &&
      (
        !this.isModification() ||
        coutModifie ||
        dateModifiee
      )
    );
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
      const now = new Date();

      const minDateTime =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      this.dateMinRestitution.set(minDateTime);

       this.form.patchValue({
  coutEstime: response.coutEstime ?? 0,
  dateRestitutionPrevue:
  response.dateRestitutionPrevue?.substring(0, 16) ?? ''
});

        this.form.markAsPristine();
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load intervention for quote.', error);
        this.errorMessage.set("Impossible de charger l'intervention.");
        this.loading.set(false);
      }
    });
  }

  protected enregistrerDevis(): void {
    if (!this.canSave()) {
      this.form.markAllAsTouched();
      return;
    }

    // Même logique que pour le diagnostic :
    // on affiche d'abord la confirmation.
    this.showConfirmation.set(true);
  }

  protected confirmerDevis(): void {
    this.showConfirmation.set(false);
    this.executeSave();
  }

  protected annulerConfirmation(): void {
    this.showConfirmation.set(false);
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

  if (!this.hasDiagnostic()) {
    this.errorMessage.set(
      'Le diagnostic doit être renseigné avant le devis.'
    );
    return;
  }

  this.saving.set(true);
  this.errorMessage.set(null);

  const payload = this.form.getRawValue();

this.interventionService
  .addDevis(currentIntervention.id, {
    coutEstime: Number(payload.coutEstime),
    dateRestitutionPrevue: payload.dateRestitutionPrevue
  })
  .subscribe({
    next: (updated) => {
      this.intervention.set(updated);
      this.saving.set(false);

      void this.router.navigate([
        '/interventions',
        updated.id
      ]);
    },
    error: (error: unknown) => {
      console.error('Failed to save quote.', error);
      this.errorMessage.set(
        "Impossible d'enregistrer le devis."
      );
      this.saving.set(false);
    }
  });
}

  protected retourDetail(): void {
    const interventionId = this.intervention()?.id;

    if (interventionId) {
      void this.router.navigate([
        '/interventions',
        interventionId
      ]);
      return;
    }

    void this.router.navigate(['/interventions']);
  }
}