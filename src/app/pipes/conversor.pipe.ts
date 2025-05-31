import { Pipe, PipeTransform } from '@angular/core';
import { DivisaService } from '../services/divisa.service';

@Pipe({
  name: 'conversor',
  pure: false // Permite que el pipe se actualice cuando cambian dependencias externas (como el servicio de divisas)
})
export class ConversorPipe implements PipeTransform {
  
  constructor(private divisaService: DivisaService) {}

  transform(precio: number, fromDivisa: string = 'CLP'): string {
    // Convierte el precio a la divisa seleccionada usando el servicio
    const precioConvertido = this.divisaService.convertPrice(precio, fromDivisa);
    const selectedDivisa = this.divisaService.getSelectedDivisa();
    
    switch(selectedDivisa) {
      case 'USD':
        // Formatea el precio en dólares estadounidenses con dos decimales
        const precioUsd = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(precioConvertido);
        return `USD$ ${precioUsd}`;
      
      case 'EUR':
        // Formatea el precio en euros usando el formato local español
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0
        }).format(precioConvertido);
      
      case 'CLP':
      default:
        // Formatea el precio en pesos chilenos sin decimales
        const precioClp =  new Intl.NumberFormat('es-CL', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(precioConvertido);
        return `CLP$ ${precioClp}`;
    }
  }
}