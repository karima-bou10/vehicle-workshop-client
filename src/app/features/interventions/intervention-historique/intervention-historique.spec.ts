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
                  interventionId: 1,
                  ancienStatut: 'RECUE',
                  nouveauStatut: 'DIAGNOSTIC_EN_COURS',
                  commentaire: 'Prise en charge atelier',
                  auteur: 'Conseiller',
                  username: 'conseiller',
                  date: '2026-07-31T10:00:00'
                },
                {
                  id: 2,
                  interventionId: 1,
                  ancienStatut: 'DIAGNOSTIC_EN_COURS',
                  nouveauStatut: 'DEVIS_ATTENTE',
                  commentaire: null,
                  auteur: '',
                  auteurUsername: 'atelier',
                  dateModification: '2026-07-31 12:30:00'
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

  it('should render username when provided in history row', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('conseiller');
  });

  it('should render fallback auteur username and dateModification', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('atelier');
    expect(fixture.nativeElement.textContent).toContain('31/07/2026');
    expect(fixture.nativeElement.textContent).toContain('12:30');
  });
});
