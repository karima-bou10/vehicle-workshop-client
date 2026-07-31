import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InterventionDiagnostic } from './intervention-diagnostic';
import { InterventionService } from '../services/intervention-service';

describe('InterventionDiagnostic', () => {
  let component: InterventionDiagnostic;
  let fixture: ComponentFixture<InterventionDiagnostic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionDiagnostic],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' })
            }
          }
        },
        {
          provide: InterventionService,
          useValue: {
            getById: () =>
              of({
                id: 1,
                typeIntervention: 'DIAGNOSTIC',
                descriptionClient: 'Bruit moteur',
                diagnostic: 'Bougies usées',
                statut: 'DIAGNOSTIC_EN_COURS',
                priorite: 'NORMALE',
                coutEstime: 120,
                dateDepot: '2026-07-31',
                dateRestitutionPrevue: '2026-08-02',
                dateCloture: '',
                vehiculeId: 12,
                immatriculationVehicule: 'AA-123-BB',
                mecanicienId: 0,
                nomMecanicien: ''
              }),
            updateDiagnostic: () =>
              of({
                id: 1,
                typeIntervention: 'DIAGNOSTIC',
                descriptionClient: 'Bruit moteur',
                diagnostic: 'Bougies usées',
                statut: 'DIAGNOSTIC_EN_COURS',
                priorite: 'NORMALE',
                coutEstime: 120,
                dateDepot: '2026-07-31',
                dateRestitutionPrevue: '2026-08-02',
                dateCloture: '',
                vehiculeId: 12,
                immatriculationVehicule: 'AA-123-BB',
                mecanicienId: 0,
                nomMecanicien: ''
              }),
            updateStatus: () =>
              of({
                id: 1,
                typeIntervention: 'DIAGNOSTIC',
                descriptionClient: 'Bruit moteur',
                diagnostic: 'Bougies usées',
                statut: 'DEVIS_A_VALIDER',
                priorite: 'NORMALE',
                coutEstime: 120,
                dateDepot: '2026-07-31',
                dateRestitutionPrevue: '2026-08-02',
                dateCloture: '',
                vehiculeId: 12,
                immatriculationVehicule: 'AA-123-BB',
                mecanicienId: 0,
                nomMecanicien: ''
              })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionDiagnostic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
