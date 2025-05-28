import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DivisaRate } from '../interfaces/divisa-rate';
import { BehaviorSubject, catchError, map, of } from 'rxjs';
import { TasasService } from './tasas.service';
import { Tasa } from '../interfaces/tasa';

// Interface para el localStorage
interface TasasCache {
  tasas: DivisaRate[];
  timestamp: string; // Fecha en formato ISO
}

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

  private readonly CACHE_KEY = 'ferremas_tasas_cambio';

  constructor(private http: HttpClient, private tasaService: TasasService) {
    this.loadRates();
  }

  private loadRates(): void {
    console.log('🔄 Iniciando carga de tasas...');
    
    // Primero verificar si hay tasas válidas en cache
    const cachedRates = this.getCachedRates();
    if (cachedRates) {
      console.log('💾 Usando tasas desde localStorage:', cachedRates);
      this.ratesSubject.next(cachedRates);
      return;
    }

    // Si no hay cache válido, cargar desde backend
    console.log('🌐 Cargando tasas desde backend...');
    this.loadFromBackend();
  }

  private loadFromBackend(): void {
    this.tasaService.getTasasCambio().pipe(
      map(response => {
        console.log('📊 Respuesta del backend:', response);
        return this.mapBackendResponseToRates(response);
      }),
      catchError(error => {
        console.error('❌ Error cargando tasas desde backend:', error);
        return of(this.getDefaultRates());
      })
    ).subscribe(rates => {
      // Guardar en cache
      this.saveTasasToCache(rates);
      
      // Actualizar el subject
      this.ratesSubject.next(rates);
      console.log('💾 Tasas actualizadas y guardadas en cache');
    });
  }

  private getCachedRates(): DivisaRate[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        console.log('📭 No hay tasas en cache');
        return null;
      }

      const tasasCache: TasasCache = JSON.parse(cached);
      
      // Verificar si las tasas son del día actual
      if (this.isCacheValid(tasasCache.timestamp)) {
        console.log('✅ Cache válido, tasas del día actual');
        return tasasCache.tasas;
      } else {
        console.log('⏰ Cache expirado, necesita renovación');
        localStorage.removeItem(this.CACHE_KEY); // Limpiar cache expirado
        return null;
      }

    } catch (error) {
      console.error('❌ Error leyendo cache:', error);
      localStorage.removeItem(this.CACHE_KEY); // Limpiar cache corrupto
      return null;
    }
  }

  private isCacheValid(cacheTimestamp: string): boolean {
    try {
      const cacheDate = new Date(cacheTimestamp);
      const today = new Date();
      
      // Comparar solo la fecha (año, mes, día)
      const isSameDay = 
        cacheDate.getFullYear() === today.getFullYear() &&
        cacheDate.getMonth() === today.getMonth() &&
        cacheDate.getDate() === today.getDate();

      console.log(`📅 Fecha cache: ${cacheDate.toDateString()}, Hoy: ${today.toDateString()}, Válido: ${isSameDay}`);
      
      return isSameDay;
    } catch (error) {
      console.error('❌ Error validando fecha del cache:', error);
      return false;
    }
  }

  private saveTasasToCache(tasas: DivisaRate[]): void {
    try {
      const tasasCache: TasasCache = {
        tasas: tasas,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(tasasCache));
      console.log('💾 Tasas guardadas en localStorage');

    } catch (error) {
      console.error('❌ Error guardando tasas en cache:', error);
    }
  }

  private mapBackendResponseToRates(tasas: Tasa[]): DivisaRate[] {
    // Siempre incluir CLP como base
    const rates: DivisaRate[] = [
      { code: 'CLP', name: 'Peso Chileno', rate: 1 }
    ];
    
    // Mapear respuesta del backend
    tasas.forEach(tasa => {
      const divisaName = this.getDivisaName(tasa.currency);
      rates.push({
        code: tasa.currency,
        name: divisaName,
        rate: tasa.rate
      });
    });
    
    console.log('✅ Tasas procesadas:', rates);
    return rates;
  }

  private getDivisaName(currency: string): string {
    const divisaNames: { [key: string]: string } = {
      'USD': 'Dólar',
      'EUR': 'Euro',
      'CLP': 'Peso Chileno'
    };
    
    return divisaNames[currency] || currency;
  }

  private getDefaultRates(): DivisaRate[] {
    const defaultRates: DivisaRate[] = [
      { code: 'CLP', name: 'Peso Chileno', rate: 1 },
      { code: 'USD', name: 'Dólar', rate: 950 },
      { code: 'EUR', name: 'Euro', rate: 1050 }
    ];
    
    console.warn('⚠️ Usando tasas por defecto:', defaultRates);
    return defaultRates;
  }

  // Método público para forzar actualización desde backend
  refreshRates(): void {
    console.log('🔄 Refrescando tasas manualmente...');
    localStorage.removeItem(this.CACHE_KEY); // Limpiar cache
    this.loadFromBackend();
  }

  // Método para limpiar cache manualmente
  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    console.log('🗑️ Cache de tasas limpiado');
  }

  // Método para verificar si las tasas están en cache
  hasCachedRates(): boolean {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (!cached) return false;

    try {
      const tasasCache: TasasCache = JSON.parse(cached);
      return this.isCacheValid(tasasCache.timestamp);
    } catch {
      return false;
    }
  }

  // Método para obtener la fecha del último cache
  getLastCacheDate(): Date | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const tasasCache: TasasCache = JSON.parse(cached);
      return new Date(tasasCache.timestamp);
    } catch {
      return null;
    }
  }

  // Método para obtener las tasas actuales
  getCurrentRates(): DivisaRate[] {
    return this.ratesSubject.value;
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