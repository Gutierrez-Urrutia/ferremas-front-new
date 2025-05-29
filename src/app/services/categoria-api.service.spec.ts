import { TestBed } from '@angular/core/testing';

import { CategoriaApiService } from './categoria-api.service';

describe('CategoriaApiService', () => {
  let service: CategoriaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoriaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
