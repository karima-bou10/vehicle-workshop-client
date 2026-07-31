import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InterventionResponse, type InterventionStatus } from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { WorkflowStepper } from '../../../shared/ui/workflow-stepper/workflow-stepper';
import { canTransitionToStatus, getNextWorkflowStatus } from '../models/intervention-workflow';

@Component({
  selector: 'app-intervention-detail',
  imports: [DatePipe, StatusTag, WorkflowStepper],
  templateUrl: './intervention-detail.html',
  styleUrl: './intervention-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly interventionService = inject(InterventionService);

  readonly intervention = signal<InterventionResponse | null>(null);
  readonly loading = signal(true);
  readonly actionLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly transitionAuthor = signal('');
  readonly transitionComment = signal('');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const interventionId = Number(idParam);

    if (!idParam || Number.isNaN(interventionId)) {
      this.errorMessage.set("Identifiant d'intervention invalide.");
      this.loading.set(false);
      return;
    }

    this.loadIntervention(interventionId);
  }

  retourListe(): void {
    void this.router.navigate(['/interventions']);
  }

  allerDiagnostic(): void {
    const id = this.intervention()?.id;
    if (id) {
      void this.router.navigate(['/interventions', id, 'diagnostic']);
    }
  }

  allerAffectation(): void {
    const id = this.intervention()?.id;
    if (id) {
      void this.router.navigate(['/interventions', id, 'affectation']);
    }
  }

  allerHistorique(): void {
    const id = this.intervention()?.id;
    if (id) {
      void this.router.navigate(['/interventions', id, 'historique']);
    }
  }

  setTransitionAuthor(value: string): void {
    this.transitionAuthor.set(value);
  }

  setTransitionComment(value: string): void {
    this.transitionComment.set(value);
  }

  passerStatutSuivant(): void {
    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return;
    }

    const targetStatus = getNextWorkflowStatus(currentIntervention.statut);
    if (!targetStatus) {
      this.errorMessage.set('Aucune transition suivante disponible.');
      return;
    }

    this.transitionTo(targetStatus);
  }

  annulerIntervention(): void {
    this.transitionTo('ANNULEE');
  }

  protected nextStatusLabel(): string | null {
    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return null;
    }

    return getNextWorkflowStatus(currentIntervention.statut);
  }

  private transitionTo(targetStatus: InterventionStatus): void {
    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return;
    }

    const author = this.transitionAuthor().trim();
    if (author.length < 2) {
      this.errorMessage.set('Auteur obligatoire pour historiser la transition.');
      return;
    }

    const transitionCheck = canTransitionToStatus(currentIntervention, targetStatus);
    if (!transitionCheck.allowed) {
      this.errorMessage.set(transitionCheck.reason ?? 'Transition refusée.');
      return;
    }

    this.errorMessage.set(null);
    this.actionLoading.set(true);
    this.interventionService
      .updateStatus(currentIntervention.id, {
        nouveauStatut: targetStatus,
        auteur: author,
        commentaire: this.transitionComment().trim() || undefined
      })
      .subscribe({
        next: (updated) => {
          this.intervention.set(updated);
          this.actionLoading.set(false);
        },
        error: (error: unknown) => {
          console.error('Failed to update intervention status.', error);
          this.errorMessage.set('Mise à jour du statut refusée côté backend.');
          this.actionLoading.set(false);
        }
      });
  }

  private loadIntervention(id: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.interventionService.getById(id).subscribe({
      next: (response: InterventionResponse) => {
        this.intervention.set(response);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load intervention details.', error);
        this.errorMessage.set("Impossible de charger le détail de l'intervention.");
        this.loading.set(false);
      }
    });
  }
}