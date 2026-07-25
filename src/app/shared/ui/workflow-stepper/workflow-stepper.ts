import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { STATUT_METADATA, StatutIntervention, WORKFLOW_ORDRE } from '../../../core/models';

interface Etape {
  statut: StatutIntervention;
  label: string;
  etat: 'faite' | 'courante' | 'a-venir';
  rang: number;
}

@Component({
  selector: 'app-workflow-stepper',
  templateUrl: './workflow-stepper.html',
  styleUrl: './workflow-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowStepper {
  readonly statut = input.required<StatutIntervention>();

  readonly annulee = computed(() => this.statut() === 'ANNULEE');

  readonly etapes = computed<Etape[]>(() => {
    const courant = WORKFLOW_ORDRE.indexOf(this.statut());
    return WORKFLOW_ORDRE.map((statut, i) => ({
      statut,
      label: STATUT_METADATA[statut].label,
      rang: i + 1,
      etat: courant === -1 || i > courant ? 'a-venir' : i === courant ? 'courante' : 'faite',
    }));
  });
}
