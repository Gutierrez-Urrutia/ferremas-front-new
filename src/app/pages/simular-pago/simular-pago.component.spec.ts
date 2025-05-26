import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimularPagoComponent } from './simular-pago.component';

describe('SimularPagoComponent', () => {
  let component: SimularPagoComponent;
  let fixture: ComponentFixture<SimularPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimularPagoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimularPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
