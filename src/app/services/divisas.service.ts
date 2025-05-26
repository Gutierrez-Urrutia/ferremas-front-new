import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { DivisaRate } from '../interfaces/divisa-rate'; // Asegúrate de tener esta interfaz definida
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class DivisaService {
  private selectedDivisaSubject = new BehaviorSubject<string>('CLP');
  private ratesSubject = new BehaviorSubject<DivisaRate[]>([
    { code: 'CLP', name: 'Peso Chileno', rate: 1 }
  ]);

  selectedDivisa$ = this.selectedDivisaSubject.asObservable();
  rates$ = this.ratesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadRates();
  }

  private loadRates(): void {
    const today = new Date().toISOString().split('T')[0];
    
    // API del Banco Central para USD y EUR
    const usdUrl = `https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?user=tu_usuario&pass=tu_password&firstdate=${today}&lastdate=${today}&timeseries=F073.TCO.PRE.Z.D&function=GetSeries`;
    const eurUrl = `https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?user=tu_usuario&pass=tu_password&firstdate=${today}&lastdate=${today}&timeseries=F072.CLP.EUR.N.O.D&function=GetSeries`;

    // Para desarrollo, usa valores fijos o una API alternativa
    this.ratesSubject.next([
      { code: 'CLP', name: 'Peso Chileno', rate: 1 },
      { code: 'USD', name: 'Dólar', rate: 950 }, // 1 USD = 950 CLP (ejemplo)
      { code: 'EUR', name: 'Euro', rate: 1050 }   // 1 EUR = 1050 CLP (ejemplo)
    ]);
  }

  setSelectedDivisa(Divisa: string): void {
    this.selectedDivisaSubject.next(Divisa);
  }

  getSelectedDivisa(): string {
    return this.selectedDivisaSubject.value;
  }

  convertPrice(price: number, fromDivisa: string = 'CLP', toDivisa?: string): number {
    const targetDivisa = toDivisa || this.getSelectedDivisa();
    const rates = this.ratesSubject.value;
    
    if (fromDivisa === targetDivisa) {
      return price;
    }
    
    const fromRate = rates.find(r => r.code === fromDivisa)?.rate || 1;
    const toRate = rates.find(r => r.code === targetDivisa)?.rate || 1;
    
    // Si estamos convirtiendo desde CLP
    if (fromDivisa === 'CLP') {
      return price / toRate;
    }
    
    // Si estamos convirtiendo a CLP
    if (targetDivisa === 'CLP') {
      return price * fromRate;
    }
    
    // Convertir de cualquier moneda a otra pasando por CLP
    const priceInCLP = price * fromRate;
    return priceInCLP / toRate;
  }

  formatPrice(price: number, fromDivisa: string = 'CLP'): string {
    const convertedPrice = this.convertPrice(price, fromDivisa);
    const selectedDivisa = this.getSelectedDivisa();
    
    switch(selectedDivisa) {
      case 'USD':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(convertedPrice);
      
      case 'EUR':
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0
        }).format(convertedPrice);
      
      case 'CLP':
      default:
        return new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0
        }).format(convertedPrice);
    }
  }
}