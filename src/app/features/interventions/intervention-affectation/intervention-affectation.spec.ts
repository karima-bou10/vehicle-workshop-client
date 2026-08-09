import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InterventionAffectation } from './intervention-affectation';
import { InterventionService } from '../services/intervention-service';

describe('InterventionAffectation', () => {
  let component: InterventionAffectation;
  let fixture: ComponentFixture<InterventionAffectation>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionAffectation],
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
                typeIntervention: 'REPARATION',
                descriptionClient: 'Fuite huile',
                diagnostic: 'Joint à remplacer',
                statut: 'DEVIS_A_VALIDER',
                priorite: 'HAUTE',
                coutEstime: 200,
                dateDepot: '2026-07-31',
                dateRestitutionPrevue: '2026-08-02',
                dateCloture: '',
                vehiculeId: 12,
                immatriculationVehicule: 'AA-123-BB',
                mecanicienId: 0,
                nomMecanicien: ''
              }),
            updateAffectation: () =>
              of({
                id: 1,
                typeIntervention: 'REPARATION',
                descriptionClient: 'Fuite huile',
                diagnostic: 'Joint à remplacer',
                statut: 'DEVIS_A_VALIDER',
                priorite: 'HAUTE',
                coutEstime: 200,
                dateDepot: '2026-07-31',
                dateRestitutionPrevue: '2026-08-02',
                dateCloture: '',
                vehiculeId: 12,
                immatriculationVehicule: 'AA-123-BB',
                mecanicienId: 5,
                nomMecanicien: 'Yacine'
              })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionAffectation);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    router.navigate = () => Promise.resolve(true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should only show one save action button', () => {
    fixture.detectChanges();
    const actionButtons = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('.form__actions button')
    );

    expect(actionButtons.length).toBe(1);
    expect(actionButtons[0].textContent?.trim()).toBe('Enregistrer');
  });
});
