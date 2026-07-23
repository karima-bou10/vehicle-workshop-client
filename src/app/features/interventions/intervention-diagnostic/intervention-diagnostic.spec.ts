import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionDiagnostic } from './intervention-diagnostic';

describe('InterventionDiagnostic', () => {
  let component: InterventionDiagnostic;
  let fixture: ComponentFixture<InterventionDiagnostic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionDiagnostic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionDiagnostic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
