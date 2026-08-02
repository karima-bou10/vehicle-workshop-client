import { ChangeDetectionStrategy, Component, computed, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification-service';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { VehiculeRequest } from '../models/vehicule-model';
import { VehiculeService } from '../services/vehicule-service';


/** Format des plaques françaises : AB-123-CD.*/
const PATTERN_IMMAT = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;

@Component({
  selector: 'app-vehicule-form',
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinner],
  templateUrl: './vehicule-form.html',
  styleUrl: './vehicule-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiculeForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(VehiculeService);
  private readonly notif = inject(NotificationService);
  private readonly router = inject(Router);

  /** Alimenté par la route :id — absent en création. */
  readonly id = input(undefined, { transform: numberAttribute });

  readonly editMode = computed(() => !!this.id());
  readonly loading = signal(false);
  readonly submitting = signal(false);

  readonly maxYear = new Date().getFullYear() + 1;

  readonly form = this.fb.nonNullable.group({
    immatriculationFictive: ['', [Validators.required, Validators.pattern(PATTERN_IMMAT)]],
    marque: ['', [Validators.required, Validators.maxLength(50)]],
    modele: ['', [Validators.required, Validators.maxLength(50)]],
    annee: [new Date().getFullYear(), [Validators.required, Validators.min(1950), Validators.max(this.maxYear)]],
    kilometrage: [0, [Validators.required, Validators.min(0), Validators.max(2_000_000)]],
    clientFictif: ['', [Validators.required, Validators.maxLength(80)]],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;

      this.loading.set(true);
      this.service.getVehiculeById(id).subscribe({
        next: v => {
          this.form.patchValue({
            immatriculationFictive: v.immatriculationFictive,
            marque: v.marque,
            modele: v.modele,
            annee: v.annee,
            kilometrage: v.kilometrage,
            clientFictif: v.clientFictif,
          });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/vehicules']);
        },
      });
    });
  }

  isInvalid(nom: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[nom];
    return c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: VehiculeRequest = {
      ...v,
      immatriculationFictive: v.immatriculationFictive.toUpperCase(),
    };

    this.submitting.set(true);
    const id = this.id();
    const request = id ? this.service.updateVehicule(id, payload) : this.service.createVehicule(payload);

    request.subscribe({
      next: vehicule => {
        this.notif.success(id ? 'Véhicule mis à jour.' : 'Véhicule enregistré.');
        this.router.navigate(['/vehicules', vehicule.id]);
      },
      error: () => this.submitting.set(false),
    });
  }
}