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
import { canTransitionToStatus } from '../models/intervention-workflow';

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

  // Panneau de confirmation avec commentaire
  readonly pendingTransition = signal<InterventionStatus | null>(null);
  readonly commentaireSaisie = signal('');

  readonly vehiculeLibelle = computed(() => {
    const vehicule = this.vehicule();
    if (!vehicule) {
      return '—';
    }
    return `${vehicule.marque} ${vehicule.modele}`;
  });

  readonly commentaireRequis = computed(
    () => this.pendingTransition() === 'ANNULEE'
  );

readonly diagnosticDesactive = computed(() => {

const statut = this.intervention()?.statut ?? '';

    return [

    'DEVIS_A_VALIDER',

    'TERMINEE',

    'RESTITUEE',

    'EN_REPARATION'].includes(statut);
});
   /*
    () => (this.intervention()?.diagnostic?.trim().length ?? 0) > 0
    */


  readonly devisRenseigne = computed(
    () => this.intervention()?.coutEstime !== null
  );

readonly passerReparation = computed(() =>
  ["EN_REPARATION", "TERMINEE", "RESTITUEE"].includes(
    this.intervention()?.statut ?? ""
  )
);

  
  readonly modificationAutorisee = computed(() =>
  ["EN_REPARATION", "TERMINEE", "RESTITUEE"].includes(
    this.intervention()?.statut ?? ""
  )
);

  readonly canConfirmer = computed(() => {
    if (!this.pendingTransition()) {
      return false;
    }
    if (this.commentaireRequis() && !this.commentaireSaisie().trim()) {
      return false;
    }
    return true;
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



  allerDiagnostic(): void {
    if (this.diagnosticRenseigne()) {
      return;
    }
    const id = this.intervention()?.id;
    if (id) {
      void this.router.navigate(['/interventions', id, 'diagnostic']);
    }
  }

  allerDevis(): void {
    if (this.devisRenseigne()) {
      return;
    }
    const id = this.intervention()?.id;
    if (id) {
      void this.router.navigate(['/interventions', id, 'devis']);
    }
  }

  allerAffectation(): void {
    const id = this.intervention()?.id;
        if (this.passerReparation()) {
      return;
    }
    if (id) {
      void this.router.navigate(['/interventions', id, 'affectation']);
    }
  }

  allerEdition(): void {
    const id = this.intervention()?.id;
    if (id) {
      void this.router.navigate(['/interventions', id, 'edit']);
    }
  }

  allerHistorique(): void {
    const id = this.intervention()?.id;
    if (id) {
      void this.router.navigate(['/interventions', id, 'historique']);
    }
  }

  protected canPasserEnReparation(): boolean {
    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return false;
    }
    return canTransitionToStatus(currentIntervention, 'EN_REPARATION').allowed;
  }

  protected canPasserTerminee(): boolean {
    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return false;
    }
    return canTransitionToStatus(currentIntervention, 'TERMINEE').allowed;
  }

  protected canPasserRestituee(): boolean {
    const currentIntervention = this.intervention();
    if (!currentIntervention) {
      return false;
    }
    return canTransitionToStatus(currentIntervention, 'RESTITUEE').allowed;
  }

  protected ouvrirConfirmation(status: InterventionStatus): void {
    this.commentaireSaisie.set('');
    this.errorMessage.set(null);
    this.pendingTransition.set(status);
  }

  protected annulerConfirmation(): void {
    this.pendingTransition.set(null);
    this.commentaireSaisie.set('');
  }

  protected confirmerTransition(): void {
    const targetStatus = this.pendingTransition();
    if (!targetStatus) {
      return;
    }

    this.pendingTransition.set(null);
    const commentaire = this.commentaireSaisie().trim() || undefined;
    this.commentaireSaisie.set('');
    this.transitionTo(targetStatus, commentaire);
  }

  protected titreConfirmation(): string {
    switch (this.pendingTransition()) {
      case 'EN_REPARATION': return 'Confirmer le passage en réparation';
      case 'TERMINEE':      return 'Confirmer la fin de réparation';
      case 'ANNULEE':       return "Confirmer l'annulation";
      case 'RESTITUEE':     return 'Confirmer la restitution';
      default:              return 'Confirmer';
    }
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
        ...(commentaire ? { commentaire } : {})
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
        this.vehicule.set(null);
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

        if (intervention.immatriculationVehicule?.trim()) {
          return;
        }

        this.intervention.update((currentIntervention) =>
          currentIntervention
            ? {
                ...currentIntervention,
                immatriculationVehicule: vehicule.immatriculationFictive
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