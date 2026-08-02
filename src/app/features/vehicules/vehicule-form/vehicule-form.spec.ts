import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { VehiculeForm } from './vehicule-form';
import { VehiculeService } from '../services/vehicule-service';
import { NotificationService } from '../../../core/services/notification-service';

describe('VehiculeForm', () => {
  let component: VehiculeForm;
  let fixture: ComponentFixture<VehiculeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeForm],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {}
          }
        },
        {
          provide: VehiculeService,
          useValue: {
            getVehiculeById: () => of({
              id: 1,
              immatriculationFictive: 'AA-123-BB',
              marque: 'Renault',
              modele: 'Clio',
              annee: 2020,
              kilometrage: 10000,
              clientFictif: 'Client'
            }),
            createVehicule: () => of({
              id: 1,
              immatriculationFictive: 'AA-123-BB',
              marque: 'Renault',
              modele: 'Clio',
              annee: 2020,
              kilometrage: 10000,
              clientFictif: 'Client'
            }),
            updateVehicule: () => of({
              id: 1,
              immatriculationFictive: 'AA-123-BB',
              marque: 'Renault',
              modele: 'Clio',
              annee: 2020,
              kilometrage: 10000,
              clientFictif: 'Client'
            })
          }
        },
        {
          provide: NotificationService,
          useValue: {
            success: () => undefined
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
