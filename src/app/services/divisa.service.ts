import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DivisaRate } from '../interfaces/divisa-rate';
import { BehaviorSubject, catchError, map, of } from 'rxjs';
import { TasasService } from './tasas.service';
import { Tasa } from '../interfaces/tasa';
import { TasasCache } from '../interfaces/tasas-cache';

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
  console.log('🚀 DivisaService inicializado');
  this.loadRates();
}

  /*
   Intenta cargar las tasas desde cache, si no existen o están expiradas, las carga desde el backend.
  */
  private loadRates(): void {
    console.log('Iniciando carga de tasas...');

    const cachedRates = this.getCachedRates();
    if (cachedRates) {
      console.log('Usando tasas desde localStorage:', cachedRates);
      this.ratesSubject.next(cachedRates);
      return;
    }

    console.log('Cargando tasas desde backend...');
    this.loadFromBackend();
  }

  /*
   Obtiene las tasas desde el backend y las guarda en cache.
  */
  private loadFromBackend(): void {
    console.log('🔄 Iniciando carga desde backend...');
    console.log('🌐 URL del servicio:', 'http://localhost:8090/api/v1/tasas');

    this.tasaService.getTasasCambio().pipe(
      map(response => {
        console.log('✅ Respuesta RAW del backend:', response);
        console.log('🔍 Tipo de respuesta:', typeof response);
        console.log('🔍 Es array:', Array.isArray(response));
        console.log('🔍 Longitud del array:', response?.length);

        if (Array.isArray(response) && response.length > 0) {
          console.log('🔍 Primer elemento:', response[0]);
        }

        const mappedRates = this.mapBackendResponseToRates(response);
        console.log('📊 Tasas mapeadas:', mappedRates);
        return mappedRates;
      }),
      catchError(error => {
        console.error('❌ ERROR en getTasasCambio():');
        console.error('🔍 Error status:', error?.status);
        console.error('🔍 Error message:', error?.message);
        console.error('🔍 Error completo:', error);

        // Verificar si es un error de CORS
        if (error?.status === 0) {
          console.error('🚫 Posible error de CORS o servidor no disponible');
        }

        return of(this.getDefaultRates());
      })
    ).subscribe({
      next: (rates) => {
        console.log('💾 Guardando tasas:', rates);
        this.saveTasasToCache(rates);
        this.ratesSubject.next(rates);
        console.log('✅ Proceso completado exitosamente');
      },
      error: (error) => {
        console.error('❌ Error en subscribe:', error);
      }
    });
  }

  /*
   Lee las tasas almacenadas en cache local si son válidas.
  */
  private getCachedRates(): DivisaRate[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        console.log('📭 No hay tasas en cache');
        return null;
      }

      const tasasCache: TasasCache = JSON.parse(cached);

      if (this.isCacheValid(tasasCache.timestamp)) {
        console.log('Cache válido, tasas del día actual');
        return tasasCache.tasas;
      } else {
        console.log('Cache expirado, necesita renovación');
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }

    } catch (error) {
      console.error('Error leyendo cache:', error);
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    }
  }

  /*
   Verifica si la fecha del cache corresponde al día actual.
  */
  private isCacheValid(cacheTimestamp: string): boolean {
    try {
      const cacheDate = new Date(cacheTimestamp);
      const today = new Date();

      const isSameDay =
        cacheDate.getFullYear() === today.getFullYear() &&
        cacheDate.getMonth() === today.getMonth() &&
        cacheDate.getDate() === today.getDate();

      console.log(`Fecha cache: ${cacheDate.toDateString()}, Hoy: ${today.toDateString()}, Válido: ${isSameDay}`);

      return isSameDay;
    } catch (error) {
      console.error('Error validando fecha del cache:', error);
      return false;
    }
  }

  /*
   Guarda las tasas y la fecha actual en el cache local.
  */
  private saveTasasToCache(tasas: DivisaRate[]): void {
    try {
      const tasasCache: TasasCache = {
        tasas: tasas,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(tasasCache));
      console.log('Tasas guardadas en localStorage');

    } catch (error) {
      console.error('Error guardando tasas en cache:', error);
    }
  }

  /*
   Convierte la respuesta del backend al formato interno de tasas.
  */
  private mapBackendResponseToRates(tasas: Tasa[]): DivisaRate[] {

    const rates: DivisaRate[] = [
      { code: 'CLP', name: 'Peso Chileno', rate: 1 }
    ];

    tasas.forEach(tasa => {
      const divisaName = this.getDivisaName(tasa.currency);
      rates.push({
        code: tasa.currency,
        name: divisaName,
        rate: tasa.rate
      });
    });

    console.log('Tasas procesadas:', rates);
    return rates;
  }

  /*
   Devuelve el nombre legible de una divisa a partir de su código.
  */
  private getDivisaName(currency: string): string {
    const divisaNames: { [key: string]: string } = {
      'USD': 'Dólar',
      'EUR': 'Euro',
      'CLP': 'Peso Chileno'
    };

    return divisaNames[currency] || currency;
  }

  /*
   Retorna tasas por defecto en caso de error o ausencia de datos.
  */
  private getDefaultRates(): DivisaRate[] {
    const defaultRates: DivisaRate[] = [
      { code: 'CLP', name: 'Peso Chileno', rate: 1 },
      { code: 'USD', name: 'Dólar', rate: 950 },
      { code: 'EUR', name: 'Euro', rate: 1050 }
    ];

    console.warn('Usando tasas por defecto:', defaultRates);
    return defaultRates;
  }

  refreshRates(): void {
    console.log('Refrescando tasas manualmente...');
    localStorage.removeItem(this.CACHE_KEY);
    this.loadFromBackend();
  }

  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    console.log('Cache de tasas limpiado');
  }

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

  getCurrentRates(): DivisaRate[] {
    return this.ratesSubject.value;
  }

  setSelectedDivisa(Divisa: string): void {
    this.selectedDivisaSubject.next(Divisa);
  }

  getSelectedDivisa(): string {
    return this.selectedDivisaSubject.value;
  }

  /*
   Convierte un precio de una divisa a otra usando las tasas actuales.
   Si no se especifica la divisa destino, se usa la seleccionada actualmente.
  */
  convertPrice(price: number, fromDivisa: string = 'CLP', toDivisa?: string): number {
    const targetDivisa = toDivisa || this.getSelectedDivisa();
    const rates = this.ratesSubject.value;

    if (fromDivisa === targetDivisa) {
      return price;
    }

    const fromRate = rates.find(r => r.code === fromDivisa)?.rate || 1;
    const toRate = rates.find(r => r.code === targetDivisa)?.rate || 1;

    if (fromDivisa === 'CLP') {
      return price / toRate;
    }

    if (targetDivisa === 'CLP') {
      return price * fromRate;
    }

    const priceInCLP = price * fromRate;
    return priceInCLP / toRate;
  }

  /*
   Formatea un precio convertido a la divisa seleccionada, usando el formato local adecuado.
  */
  formatPrice(price: number, fromDivisa: string = 'CLP'): string {
    const convertedPrice = this.convertPrice(price, fromDivisa);
    const selectedDivisa = this.getSelectedDivisa();

    switch (selectedDivisa) {
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