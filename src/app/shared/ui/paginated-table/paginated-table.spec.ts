import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatedTable } from './paginated-table';

describe('PaginatedTable', () => {
  let component: PaginatedTable<unknown>;
  let fixture: ComponentFixture<PaginatedTable<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatedTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginatedTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('colonnes', [{ key: 'id', label: 'ID' }]);
    fixture.componentRef.setInput('lignes', []);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
