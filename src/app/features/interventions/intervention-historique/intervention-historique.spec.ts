import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionHistorique } from './intervention-historique';

describe('InterventionHistorique', () => {
  let component: InterventionHistorique;
  let fixture: ComponentFixture<InterventionHistorique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionHistorique]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionHistorique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
