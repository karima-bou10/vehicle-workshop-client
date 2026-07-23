import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatedTable } from './paginated-table';

describe('PaginatedTable', () => {
  let component: PaginatedTable;
  let fixture: ComponentFixture<PaginatedTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatedTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginatedTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
