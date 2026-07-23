import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionAffectation } from './intervention-affectation';

describe('InterventionAffectation', () => {
  let component: InterventionAffectation;
  let fixture: ComponentFixture<InterventionAffectation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionAffectation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionAffectation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
