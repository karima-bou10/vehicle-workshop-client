import { TestBed } from '@angular/core/testing';

import { MecanicienService } from './mecanicien-service';

describe('MecanicienService', () => {
  let service: MecanicienService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MecanicienService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
