import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  InterventionCreatePayload,
  InterventionService,
} from '../services/intervention-service';

@Component({
  selector: 'app-intervention-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './intervention-form.html',
  styleUrl: './intervention-form.scss',
})
export class InterventionForm {
  private readonly fb = inject(FormBuilder);
  private readonly interventionService = inject(InterventionService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly serverSuccess = signal<string | null>(null);

  protected readonly typeOptions = [
    'DIAGNOSTIC',
    'REVISION',
    'REPARATION',
    'CONTROLE',
    'PNEUMATIQUES',
    'AUTRE',
  ];

  protected readonly statutOptions = [
    'RECUE',
    'DEVIS_A_VALIDER',
    'DIAGNOSTIC_EN_COURS',
    'EN_REPARATION',
    'ANNULEE',
    'TERMINEE',
    'RESTITUEE',
  ];

  protected readonly prioriteOptions = ['BASSE', 'MOYENNE', 'HAUTE', 'URGENTE'];

  protected readonly form = this.fb.nonNullable.group({
    typeIntervention: ['DIAGNOSTIC', [Validators.required]],
    descriptionClient: ['', [Validators.required, Validators.minLength(5)]],
    diagnostic: ['', [Validators.required, Validators.minLength(5)]],
    statut: ['RECUE', [Validators.required]],
    priorite: ['MOYENNE', [Validators.required]],
    coutEstime: [0, [Validators.required, Validators.min(0)]],
    dateDepot: ['', [Validators.required]],
    dateRestitutionPrevue: [''],
    dateCloture: [''],
    vehiculeId: [0, [Validators.required, Validators.min(1)]],
    mecanicienId: [0, [Validators.required, Validators.min(1)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.serverError.set(null);
    this.serverSuccess.set(null);
    this.submitting.set(true);

    const payload = this.buildPayload();

    this.interventionService
      .createIntervention(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.serverSuccess.set('Intervention enregistree avec succes.');
          this.form.reset({
            typeIntervention: 'DIAGNOSTIC',
            descriptionClient: '',
            diagnostic: '',
            statut: 'RECUE',
            priorite: 'MOYENNE',
            coutEstime: 0,
            dateDepot: '',
            dateRestitutionPrevue: '',
            dateCloture: '',
            vehiculeId: 0,
            mecanicienId: 0,
          });

          void this.router.navigate(['/interventions']);
        },
        error: () => {
          this.serverError.set(
            'Creation impossible. Verifie les IDs vehicule/mecanicien et ton authentification.'
          );
        },
      });
  }

  protected hasError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  private buildPayload(): InterventionCreatePayload {
    const value = this.form.getRawValue();

    return {
      id: null,
      typeIntervention: value.typeIntervention,
      descriptionClient: value.descriptionClient.trim(),
      diagnostic: value.diagnostic.trim(),
      statut: value.statut,
      priorite: value.priorite,
      coutEstime: Number(value.coutEstime),
      dateDepot: this.toIsoLocalDateTime(value.dateDepot),
      dateRestitutionPrevue: this.optionalIsoLocalDateTime(value.dateRestitutionPrevue),
      dateCloture: this.optionalIsoLocalDateTime(value.dateCloture),
      vehiculeId: Number(value.vehiculeId),
      mecanicienId: Number(value.mecanicienId),
    };
  }

  private optionalIsoLocalDateTime(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    return this.toIsoLocalDateTime(trimmed);
  }

  private toIsoLocalDateTime(value: string): string {
    return value.length === 16 ? `${value}:00` : value;
  }

}
