import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MecanicienDetail } from './mecanicien-detail';

describe('MecanicienDetail', () => {
  let component: MecanicienDetail;
  let fixture: ComponentFixture<MecanicienDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MecanicienDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(MecanicienDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
