import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InterventionDevis } from './intervention-devis';
import { InterventionService } from '../services/intervention-service';

describe('InterventionDevis', () => {
  let component: InterventionDevis;
  let fixture: ComponentFixture<InterventionDevis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionDevis],
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
                priorite: 'MOYENNE',
                coutEstime: null,
                dateDepot: '2026-07-31',
                dateRestitutionPrevue: '2026-08-02',
                dateCloture: null,
                vehiculeId: 12,
                immatriculationVehicule: 'AA-123-BB',
                mecanicienId: null,
                nomMecanicien: null
              }),
            addDevis: () =>
              of({
                id: 1,
                typeIntervention: 'DIAGNOSTIC',
                descriptionClient: 'Bruit moteur',
                diagnostic: 'Bougies usées',
                statut: 'DEVIS_A_VALIDER',
                priorite: 'MOYENNE',
                coutEstime: 2500,
                dateDepot: '2026-07-31',
                dateRestitutionPrevue: '2026-08-02',
                dateCloture: null,
                vehiculeId: 12,
                immatriculationVehicule: 'AA-123-BB',
                mecanicienId: null,
                nomMecanicien: null
              })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InterventionDevis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
