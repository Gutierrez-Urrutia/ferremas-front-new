import { Pipe, PipeTransform } from '@angular/core';
import { DivisaService } from '../services/divisas.service';

@Pipe({
  name: 'conversor',
  pure: false // Para que se actualice cuando cambie la divisa seleccionada
})
export class ConversorPipe implements PipeTransform {
  
  constructor(private divisaService: DivisaService) {}

  transform(precio: number, fromDivisa: string = 'CLP'): string {
    const precioConvertido = this.divisaService.convertPrice(precio, fromDivisa);
    const selectedDivisa = this.divisaService.getSelectedDivisa();
    
    // Formatear según la divisa
    switch(selectedDivisa) {
      case 'USD':
        const precioUsd = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0
        }).format(precioConvertido);
        return `USD$ ${precioUsd}`;
      
      case 'EUR':
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0
        }).format(precioConvertido);
      
      case 'CLP':
      default:
        const precioClp =  new Intl.NumberFormat('es-CL', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(precioConvertido);
        return `CLP$ ${precioClp}`;
    }
  }
}