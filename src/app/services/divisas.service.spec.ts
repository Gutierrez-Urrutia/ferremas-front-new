import { TestBed } from '@angular/core/testing';
import { DivisaService } from './divisa.service';



describe('DivisasService', () => {
  let service: DivisaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DivisaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
