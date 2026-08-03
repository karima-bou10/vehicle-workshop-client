import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { VehiculeDetail } from './vehicule-detail';
import { VehiculeService } from '../services/vehicule-service';
import { InterventionService } from '../../interventions/services/intervention-service';

describe('VehiculeDetail', () => {
  let component: VehiculeDetail;
  let fixture: ComponentFixture<VehiculeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeDetail],
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
            })
          }
        },
        {
          provide: InterventionService,
          useValue: {}
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeDetail);
    fixture.componentRef.setInput('id', 1);
    fixture.detectChanges();
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
