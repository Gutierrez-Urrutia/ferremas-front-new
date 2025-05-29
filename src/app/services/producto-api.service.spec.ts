import { TestBed } from '@angular/core/testing';

import { ProductoApiService } from './producto-api.service';

describe('ProductoApiService', () => {
  let service: ProductoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
