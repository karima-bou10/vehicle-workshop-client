import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MecanicienList } from './mecanicien-list';

describe('MecanicienList', () => {
  let component: MecanicienList;
  let fixture: ComponentFixture<MecanicienList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MecanicienList]
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
