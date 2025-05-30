import { ConversorPipe } from './conversor.pipe';
import { DivisaService } from '../services/divisa.service';

describe('ConversorPipe', () => {
  let pipe: ConversorPipe;
  let mockDivisaService: jasmine.SpyObj<DivisaService>;

  beforeEach(() => {

    const spy = jasmine.createSpyObj('DivisaService', ['convertir', 'getDivisaActual']);
    spy.getDivisaActual.and.returnValue('CLP');
    spy.convertir.and.returnValue(1000);

    mockDivisaService = spy;
    pipe = new ConversorPipe(mockDivisaService);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform a number correctly', () => {
  
    mockDivisaService.convertPrice.and.returnValue(12500);
    
    const result = pipe.transform(12500);
    
    expect(result).toBeDefined();
    expect(mockDivisaService.convertPrice).toHaveBeenCalledWith(12500);
  });

  it('should handle zero values', () => {
    mockDivisaService.convertPrice.and.returnValue(0);
    
    const result = pipe.transform(0);
    
    expect(result).toBeDefined();
    expect(mockDivisaService.convertPrice).toHaveBeenCalledWith(0);
  });

  it('should handle negative values', () => {
    mockDivisaService.convertPrice.and.returnValue(-1000);
    
    const result = pipe.transform(-1000);
    
    expect(result).toBeDefined();
    expect(mockDivisaService.convertPrice).toHaveBeenCalledWith(-1000);
  });
});