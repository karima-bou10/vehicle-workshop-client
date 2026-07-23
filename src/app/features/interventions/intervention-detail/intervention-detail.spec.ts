import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionDetail } from './intervention-detail';

describe('InterventionDetail', () => {
  let component: InterventionDetail;
  let fixture: ComponentFixture<InterventionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
