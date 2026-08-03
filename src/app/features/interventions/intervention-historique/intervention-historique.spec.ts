import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InterventionHistorique } from './intervention-historique';
import { InterventionService } from '../services/intervention-service';

describe('InterventionHistorique', () => {
  let component: InterventionHistorique;
  let fixture: ComponentFixture<InterventionHistorique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionHistorique],
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
            getHistory: () =>
              of([
                {
                  id: 1,
                  ancienStatut: 'RECUE',
                  nouveauStatut: 'DIAGNOSTIC_EN_COURS',
                  commentaire: 'Prise en charge atelier',
                  auteur: 'Conseiller',
                  dateModification: '2026-07-31T10:00:00'
                }
              ])
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionHistorique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
