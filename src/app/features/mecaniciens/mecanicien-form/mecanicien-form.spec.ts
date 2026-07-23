import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MecanicienForm } from './mecanicien-form';

describe('MecanicienForm', () => {
  let component: MecanicienForm;
  let fixture: ComponentFixture<MecanicienForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MecanicienForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MecanicienForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
