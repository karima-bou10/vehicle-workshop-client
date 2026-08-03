import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { VehiculeList } from './vehicule-list';
import { VehiculeService } from '../services/vehicule-service';
import { NotificationService } from '../../../core/services/notification-service';
import { AuthService } from '../../../core/services/auth-service';

describe('VehiculeList', () => {
  let component: VehiculeList;
  let fixture: ComponentFixture<VehiculeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeList],
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
            getAllVehicules: () =>
              of({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                size: 10,
                first: true,
                last: true
              }),
            deleteVehicule: () => of(undefined)
          }
        },
        {
          provide: NotificationService,
          useValue: {
            success: () => undefined
          }
        },
        {
          provide: AuthService,
          useValue: {
            hasAnyRole: () => true
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
