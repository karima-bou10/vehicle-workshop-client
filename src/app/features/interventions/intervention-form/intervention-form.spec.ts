import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InterventionForm } from './intervention-form';
import { InterventionService } from '../services/intervention-service';
import { VehiculeService } from '../../vehicules/services/vehicule-service';

describe('InterventionForm', () => {
  let component: InterventionForm;
  let fixture: ComponentFixture<InterventionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionForm],
      providers: [
        provideRouter([]),
        {
          provide: InterventionService,
          useValue: {
            create: () =>
              of({
                id: 1,
                typeIntervention: 'DIAGNOSTIC',
                descriptionClient: 'Bruit moteur au ralenti',
                diagnostic: '',
                statut: 'RECUE',
                priorite: 'NORMALE',
                coutEstime: 0,
                dateDepot: '2026-07-31',
                dateRestitutionPrevue: '2026-08-02',
                dateCloture: '',
                vehiculeId: 3,
                immatriculationVehicule: 'AA-123-BB',
                mecanicienId: 0,
                nomMecanicien: ''
              })
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
                    annee: 2022,
                    kilometrage: 15000,
                    clientFictif: 'CLIENT-01'
                  }
                ],
                totalElements: 1,
                totalPages: 1,
                number: 0,
                size: 12,
                first: true,
                last: true
              }),
            getVehiculeById: () =>
              of({
                id: 3,
                immatriculationFictive: 'AA-123-BB',
                marque: 'Renault',
                modele: 'Clio',
                annee: 2022,
                kilometrage: 15000,
                clientFictif: 'CLIENT-01'
              })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
