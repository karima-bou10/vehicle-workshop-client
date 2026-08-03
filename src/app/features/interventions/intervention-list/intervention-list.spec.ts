import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InterventionList } from './intervention-list';
import { InterventionService } from '../services/intervention-service';
import { VehiculeService } from '../../vehicules/services/vehicule-service';

describe('InterventionList', () => {
  let component: InterventionList;
  let fixture: ComponentFixture<InterventionList>;
  const getAll = () =>
    of([
      {
        id: 1,
        typeIntervention: 'Revision',
        descriptionClient: 'Bruit moteur',
        diagnostic: null,
        statut: 'RECUE',
        priorite: 'HAUTE',
        coutEstime: null,
        dateDepot: '2026-08-02',
        dateRestitutionPrevue: '2026-08-03',
        dateCloture: null,
        vehiculeId: 3,
        immatriculationVehicule: null,
        mecanicienId: null,
        nomMecanicien: null
      }
    ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionList],
      providers: [
        provideRouter([]),
        {
          provide: InterventionService,
          useValue: {
            getAll
          }
        },
        {
          provide: VehiculeService,
          useValue: {
            getAllVehicules: () =>
              of({
                content: [
                  {
                    id: 3,
                    immatriculationFictive: 'AA-123-BB',
                    marque: 'Renault',
                    modele: 'Clio',
                    annee: 2024,
                    kilometrage: 12000,
                    clientFictif: 'Client Test'
                  }
                ],
                totalElements: 1,
                totalPages: 1,
                number: 0,
                size: 1000,
                first: true,
                last: true
              })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display vehicle registration resolved from vehicle service', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('AA-123-BB');
  });
});
