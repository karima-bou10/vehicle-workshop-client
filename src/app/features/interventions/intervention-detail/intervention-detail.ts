import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InterventionResponse, type InterventionStatus } from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';
import { VehiculeService } from '../../vehicules/services/vehicule-service';
import { VehiculeModel } from '../../vehicules/models/vehicule-model';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { WorkflowStepper } from '../../../shared/ui/workflow-stepper/workflow-stepper';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { AuthService } from '../../../core/services/auth-service';
import { canTransitionToStatus, normalizeInterventionStatus } from '../models/intervention-workflow';

@Component({
  selector: 'app-intervention-detail',
  imports: [DatePipe, StatusTag, WorkflowStepper, LoadingSpinner],
  templateUrl: './intervention-detail.html',
  styleUrl: './intervention-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly interventionService = inject(InterventionService);
  private readonly vehiculeService = inject(VehiculeService);
  private readonly auth = inject(AuthService);

  readonly intervention = signal<InterventionResponse | null>(null);
  readonly vehicule = signal<VehiculeModel | null>(null);
  readonly loading = signal(true);
  readonly actionLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly pendingTransition = signal<InterventionStatus | null>(null);
  readonly commentaireSaisie = signal('');
  readonly canEditer = computed(() => {
    const statut = normalizeInterventionStatus(this.intervention()?.statut);
    return statut === 'RECUE' || statut === 'DIAGNOSTIC_EN_COURS';
  });

  readonly canModifierDiagnostic = computed(() => {
    const statut = normalizeInterventionStatus(this.intervention()?.statut);
    return statut === 'RECUE' || statut === 'DIAGNOSTIC_EN_COURS';
  });

  readonly canModifierDevis = computed(() => {
    const statut = normalizeInterventionStatus(this.intervention()?.statut);
    return statut === 'DIAGNOSTIC_EN_COURS' || statut === 'DEVIS_A_VALIDER';
  });

  readonly vehiculeLibelle = computed(() => {
    const vehicule = this.vehicule();
    if (!vehicule) {
      return '—';
    }

    const marque = vehicule.marque?.trim() ?? '';
    const modele = vehicule.modele?.trim() ?? '';
    const libelle = `${marque} ${modele}`.trim();
    return libelle || '—';
  });

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

  allerEditer(): void {
    const id = this.intervention()?.id;
    if (id) {
      void this.router.navigate(['/interventions', id, 'edit']);
    }
  }

  allerDiagnostic(): void {
    const id = this.intervention()?.id;
    if (id) {
      void this.router.navigate(['/interventions', id, 'diagnostic']);
    }
  }

  allerDevis(): void {
    const id = this.intervention()?.id;
    if (id) {
      void this.router.navigate(['/interventions', id, 'devis']);
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

  canPasserEnReparation(): boolean {
    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return false;
    }

    return canTransitionToStatus(currentIntervention, 'EN_REPARATION').allowed;
  }

  canPasserTerminee(): boolean {
    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return false;
    }

    return canTransitionToStatus(currentIntervention, 'TERMINEE').allowed;
  }

  canPasserRestituee(): boolean {
    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return false;
    }

    return canTransitionToStatus(currentIntervention, 'RESTITUEE').allowed;
  }

  ouvrirConfirmation(targetStatus: InterventionStatus): void {
    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return;
    }

    const transitionCheck = canTransitionToStatus(currentIntervention, targetStatus);
    if (!transitionCheck.allowed) {
      this.errorMessage.set(transitionCheck.reason ?? 'Transition refusée.');
      return;
    }

    this.errorMessage.set(null);
    this.commentaireSaisie.set('');
    this.pendingTransition.set(targetStatus);
  }

  annulerConfirmation(): void {
    this.pendingTransition.set(null);
    this.commentaireSaisie.set('');
  }

  titreConfirmation(): string {
    switch (this.pendingTransition()) {
      case 'EN_REPARATION':
        return 'Confirmer le passage en réparation';
      case 'TERMINEE':
        return 'Confirmer la fin de la réparation';
      case 'RESTITUEE':
        return 'Confirmer la restitution au client';
      case 'ANNULEE':
        return "Confirmer l'annulation de l'intervention";
      default:
        return 'Confirmer la transition';
    }
  }

  commentaireRequis(): boolean {
    return this.pendingTransition() === 'ANNULEE';
  }

  canConfirmer(): boolean {
    const targetStatus = this.pendingTransition();
    if (!targetStatus) {
      return false;
    }

    if (this.commentaireRequis() && !this.commentaireSaisie().trim()) {
      return false;
    }

    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return false;
    }

    return canTransitionToStatus(currentIntervention, targetStatus).allowed;
  }

  confirmerTransition(): void {
    const targetStatus = this.pendingTransition();
    if (!targetStatus) {
      return;
    }

    const commentaire = this.commentaireSaisie().trim();
    if (this.commentaireRequis() && !commentaire) {
      this.errorMessage.set("Le commentaire est obligatoire pour une annulation.");
      return;
    }

    this.transitionTo(targetStatus, commentaire || undefined);
  }

  private transitionTo(targetStatus: InterventionStatus, commentaire?: string): void {
    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return;
    }

    const author = this.auth.currentUser()?.username.trim() ?? '';
    if (author.length < 2) {
      this.errorMessage.set("Impossible d'identifier l'utilisateur connecté.");
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
        commentaire
      })
      .subscribe({
        next: (updated) => {
          this.intervention.set(updated);
          this.pendingTransition.set(null);
          this.commentaireSaisie.set('');
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
    this.vehicule.set(null);
    this.interventionService.getById(id).subscribe({
      next: (response: InterventionResponse) => {
        this.intervention.set(response);
        this.loading.set(false);
        this.loadVehicleDetails(response);
      },
      error: (error: unknown) => {
        console.error('Failed to load intervention details.', error);
        this.errorMessage.set("Impossible de charger le détail de l'intervention.");
        this.loading.set(false);
      }
    });
  }

  private loadVehicleDetails(intervention: InterventionResponse): void {
    if (intervention.vehiculeId <= 0) {
      return;
    }

    this.vehiculeService.getVehiculeById(intervention.vehiculeId).subscribe({
      next: (vehicule: VehiculeModel) => {
        this.vehicule.set(vehicule);
        this.intervention.update((currentIntervention) =>
          currentIntervention
            ? {
                ...currentIntervention,
                immatriculationVehicule:
                  currentIntervention.immatriculationVehicule?.trim() || vehicule.immatriculationFictive
              }
            : null
        );
      },
      error: (error: unknown) => {
        console.error('Failed to load vehicle details.', error);
        this.errorMessage.set("Impossible de charger les informations du vehicule.");
      }
    });
  }
}