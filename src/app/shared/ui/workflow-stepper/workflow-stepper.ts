import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InterventionResponse } from '../../../features/interventions/models/intervention.model';
import {
  getWorkflowStepState,
  INTERVENTION_WORKFLOW_STEPS,
  type InterventionWorkflowStep,
} from '../../../features/interventions/models/intervention-workflow';

@Component({
  selector: 'app-workflow-stepper',
  templateUrl: './workflow-stepper.html',
  styleUrl: './workflow-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowStepper {
  readonly intervention = input.required<InterventionResponse>();

  protected readonly steps = INTERVENTION_WORKFLOW_STEPS;

  protected getStepState(step: InterventionWorkflowStep): string {
    return getWorkflowStepState(this.intervention().statut, step.key);
  }

  protected stepClass(step: InterventionWorkflowStep): string {
    return `workflow-stepper__step workflow-stepper__step--${this.getStepState(step)}`;
  }
}
