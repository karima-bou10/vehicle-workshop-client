import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionForm } from './intervention-form';

describe('InterventionForm', () => {
  let component: InterventionForm;
  let fixture: ComponentFixture<InterventionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionForm]
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
