import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InterventionAffectation } from './intervention-affectation';
import { InterventionService } from '../services/intervention-service';
import { AuthService } from '../../../core/services/auth-service';

describe('InterventionAffectation', () => {
  let component: InterventionAffectation;
  let fixture: ComponentFixture<InterventionAffectation>;
  let updateStatusCalls = 0;
  let router: Router;

  beforeEach(async () => {
    updateStatusCalls = 0;

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
              }),
            updateStatus: () =>
              (() => {
                updateStatusCalls += 1;
                return of({
                  id: 1,
                  typeIntervention: 'REPARATION',
                  descriptionClient: 'Fuite huile',
                  diagnostic: 'Joint à remplacer',
                  statut: 'EN_REPARATION',
                  priorite: 'HAUTE',
                  coutEstime: 200,
                  dateDepot: '2026-07-31',
                  dateRestitutionPrevue: '2026-08-02',
                  dateCloture: '',
                  vehiculeId: 12,
                  immatriculationVehicule: 'AA-123-BB',
                  mecanicienId: 5,
                  nomMecanicien: 'Yacine'
                });
              })()
          }
        },
        {
          provide: AuthService,
          useValue: {
            currentUser: () => ({ username: 'conseiller', role: 'ROLE_MANAGER' })
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

  it('should transition to EN_REPARATION when using business action button', () => {
    (component as any).form.controls.mecanicienId.setValue(5);
    (component as any).affecterEtPasserReparation();

    expect(updateStatusCalls).toBe(1);
  });
});
