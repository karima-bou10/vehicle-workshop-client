import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowStepper } from './workflow-stepper';
import { InterventionResponse } from '../../../features/interventions/models/intervention.model';

const interventionFixture: InterventionResponse = {
  id: 1,
  typeIntervention: 'Revision',
  descriptionClient: 'Controle general',
  diagnostic: 'RAS',
  statut: 'Diagnostic en cours',
  priorite: 'MOYENNE',
  coutEstime: 0,
  dateDepot: '2026-07-31',
  dateRestitutionPrevue: '2026-08-03',
  dateCloture: '',
  vehiculeId: 4,
  immatriculationVehicule: 'AA-123-BB',
  mecanicienId: 0,
  nomMecanicien: ''
};

describe('WorkflowStepper', () => {
  let component: WorkflowStepper;
  let fixture: ComponentFixture<WorkflowStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowStepper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowStepper);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('intervention', interventionFixture);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
