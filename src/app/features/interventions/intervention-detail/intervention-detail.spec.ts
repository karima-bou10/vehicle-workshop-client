import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InterventionDetail } from './intervention-detail';
import { InterventionService } from '../services/intervention-service';

describe('InterventionDetail', () => {
  let component: InterventionDetail;
  let fixture: ComponentFixture<InterventionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionDetail],
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
                typeIntervention: 'Revision',
                descriptionClient: 'Bruit moteur',
                diagnostic: 'Courroie a verifier',
                statut: 'EN_COURS',
                priorite: 'HAUTE',
                coutEstime: 150,
                dateDepot: '2026-07-31',
                dateRestitutionPrevue: '2026-08-02',
                dateCloture: '2026-08-03',
                vehiculeId: 12,
                immatriculationVehicule: 'AA-123-BB',
                mecanicienId: 7,
                nomMecanicien: 'Ali'
              })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InterventionDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});