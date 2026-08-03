<<<<<<< HEAD
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mecanicien-form',
  imports: [RouterLink],
=======
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification-service';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { SPECIALITES } from '../models/mecanicien.model';
import { MecanicienService } from '../services/mecanicien-service';
@Component({
  selector: 'app-mecanicien-form',
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinner],
>>>>>>> develop
  templateUrl: './mecanicien-form.html',
  styleUrl: './mecanicien-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MecanicienForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MecanicienService);
  private readonly notif = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string | undefined>();
  readonly modeEdition = computed(() => this.id() !== undefined);

  readonly chargement = signal(false);
  readonly envoiEnCours = signal(false);
  readonly specialites = SPECIALITES;

  readonly form = this.fb.nonNullable.group({
    prenom: ['', [Validators.required, Validators.maxLength(50)]],
    nom: ['', [Validators.required, Validators.maxLength(50)]],
    specialite: [SPECIALITES[0] as string, [Validators.required]],
    disponible: [true],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;

      this.chargement.set(true);
      this.service.parId(Number(id)).subscribe({
        next: m => { this.form.patchValue(m); this.chargement.set(false); },
        error: () => { this.chargement.set(false); this.router.navigate(['/mecaniciens']); },
      });
    });
  }

  invalide(nom: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[nom];
    return c.invalid && (c.touched || c.dirty);
  }

  soumettre(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.envoiEnCours.set(true);
    const payload = this.form.getRawValue();
    const id = this.id();

    const requete = id
      ? this.service.modifier(Number(id), payload)
      : this.service.creer(payload);

    requete.subscribe({
      next: m => {
        this.notif.success(id ? 'Mécanicien mis à jour.' : `${m.prenom} ${m.nom} ajouté à l'équipe.`);
        this.router.navigate(['/mecaniciens']);
      },
      error: () => this.envoiEnCours.set(false),
    });
  }
}
