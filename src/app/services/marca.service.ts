import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from "rxjs";
import { Marca } from "../interfaces/marca";
import { MarcaApiService } from "./marca-api.service";
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  /* Fuente de datos reactiva que mantiene la lista de marcas en memoria */
  private marcasSource = new BehaviorSubject<Marca[]>([]);
  /* Observable expuesto para que otros componentes puedan suscribirse a los cambios en la lista de marcas */
  marcas$ = this.marcasSource.asObservable();

  constructor(private marcaApiService: MarcaApiService) {
    this.cargarMarcasIniciales();
  }

  /* Carga las marcas desde el backend al inicializar el servicio.
     Si ocurre un error, utiliza una lista de marcas por defecto. */
  private cargarMarcasIniciales(): void{
    console.log('Cargando marcas desde backend...');

    this.marcaApiService.getMarcas().pipe(
      map((marcas: Marca[]) => marcas),
      catchError((error: any) => {
        console.error('Error cargando marcas desde backend:', error);
        console.warn('Usando marcas por defecto');
        return of(this.obtenerMarcasPorDefecto());
      })
    ).subscribe((marcas: Marca[]) => {
      console.log('Marcas cargadas:', marcas);
      this.marcasSource.next(marcas);
    });
  }

  /* Devuelve una lista de marcas por defecto en caso de error al cargar desde el backend */
  private obtenerMarcasPorDefecto(): Marca[] {
    return [
      { id: 1, nombre: 'Bosch' },
      { id: 2, nombre: 'Makita' },
      { id: 3, nombre: 'DeWalt' },
      { id: 4, nombre: 'Black+Decker' },
      { id: 5, nombre: 'Stanley' }
    ];
  }

  getMarcas(): Observable<Marca[]> {
    return this.marcas$;
  }

  /* Busca una marca por su ID en la lista local de marcas */
  getMarcaPorId(id: number): Observable<Marca | undefined> {
    return this.marcas$.pipe(
      map(marcas => marcas.find(marca => marca.id === id))
    );
  }

  /* Obtiene una marca por su ID directamente desde el backend.
     Si ocurre un error, retorna undefined. */
  getMarcaPorIdFromBackend(id: number): Observable<Marca | undefined> {
    return this.marcaApiService.getMarcaById(id).pipe(
      catchError((error: any) => {
        console.error('Error obteniendo marca desde backend:', error);
        return of(undefined);
      })
    );
  }

  /* Fuerza la recarga de las marcas desde el backend */
  refreshMarcas(): void {
    console.log('Refrescando marcas desde backend...');
    this.cargarMarcasIniciales();
  }

  /* Filtra las marcas locales cuyo nombre incluye el término de búsqueda (ignorando mayúsculas/minúsculas) */
  buscarMarcas(termino: string): Observable<Marca[]> {
    return this.marcas$.pipe(
      map(marcas => 
        marcas.filter(marca => marca.nombre.toLowerCase().includes(termino.toLowerCase())))
    );
  }

  /* Devuelve el valor actual de la lista de marcas almacenada en memoria */
  getMarcasActuales(): Marca[] {
    return this.marcasSource.value;
  }
}