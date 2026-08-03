import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { MecanicienList } from './mecanicien-list';

describe('MecanicienList', () => {
  let component: MecanicienList;
  let fixture: ComponentFixture<MecanicienList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MecanicienList],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {}
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MecanicienList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
