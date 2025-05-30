import { TestBed } from '@angular/core/testing';

import { MarcaApiService } from './marca-api.service';

describe('MarcaApiService', () => {
  let service: MarcaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarcaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
