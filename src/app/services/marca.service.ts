import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from "rxjs";
import { Marca } from "../interfaces/marca";
import { MarcaApiService } from "./marca-api.service";
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private marcasSource = new BehaviorSubject<Marca[]>([]);
  marcas$ = this.marcasSource.asObservable();

  constructor(private marcaApiService: MarcaApiService) {
    this.cargarMarcasIniciales();
  }

  private cargarMarcasIniciales(): void{
    console.log('🔄 Cargando marcas desde backend...');

    this.marcaApiService.getMarcas().pipe(
      map((marcas: Marca[]) => marcas),
      catchError((error: any) => {
        console.error('❌ Error cargando marcas desde backend:', error);
        console.warn('⚠️ Usando marcas por defecto');
        return of(this.obtenerMarcasPorDefecto());
      })
    ).subscribe((marcas: Marca[]) => {
      console.log('✅ Marcas cargadas:', marcas);
      this.marcasSource.next(marcas);
    });
  }

  private obtenerMarcasPorDefecto(): Marca[] {
    return [
      // Aquí puedes definir marcas por defecto si es necesario
    ];
  }

  getMarcas(): Observable<Marca[]> {
    return this.marcas$;
  }

  getMarcaPorId(id: number): Observable<Marca | undefined> {
    return this.marcas$.pipe(
      map(marcas => marcas.find(marca => marca.id === id))
    );
  }

  getMarcaPorIdFromBackend(id: number): Observable<Marca | undefined> {
    return this.marcaApiService.getMarcaById(id).pipe(
      catchError((error: any) => {
        console.error('❌ Error obteniendo marca desde backend:', error);
        return of(undefined);
      })
    );
  }

  refreshMarcas(): void {
    console.log('🔄 Refrescando marcas desde backend...');
    this.cargarMarcasIniciales();
  }

  buscarMarcas(termino: string): Observable<Marca[]> {
    return this.marcas$.pipe(
      map(marcas => 
        marcas.filter(marca => marca.nombre.toLowerCase().includes(termino.toLowerCase())))
    );
  }

  getMarcasActuales(): Marca[] {
    return this.marcasSource.value;
  }
}