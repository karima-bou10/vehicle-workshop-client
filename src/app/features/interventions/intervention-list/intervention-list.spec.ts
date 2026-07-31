import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InterventionList } from './intervention-list';
import { InterventionService } from '../services/intervention-service';

describe('InterventionList', () => {
  let component: InterventionList;
  let fixture: ComponentFixture<InterventionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionList],
      providers: [
        provideRouter([]),
        {
          provide: InterventionService,
          useValue: {
            getAll: () => of([])
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
});
