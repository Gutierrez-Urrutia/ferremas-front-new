import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Categoria } from '../interfaces/categoria';
import { CategoriaApiService } from './categoria-api.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  // Fuente reactiva que mantiene el estado actual de las categorías en memoria
  private categoriasSource = new BehaviorSubject<Categoria[]>([]);
  categorias$ = this.categoriasSource.asObservable();

  constructor(private categoriaApiService: CategoriaApiService) {
    this.cargarCategoriasIniciales();
  }

  /* Carga las categorías desde el backend al inicializar el servicio.
  Si ocurre un error, utiliza categorías por defecto.*/
  private cargarCategoriasIniciales(): void {
    console.log('Cargando categorías desde backend...');

    this.categoriaApiService.getCategorias().pipe(
      map((categorias: Categoria[]) => categorias),
      catchError((error: any) => {
        console.error('Error cargando categorías desde backend:', error);
        console.warn('Usando categorías por defecto');
        return of(this.obtenerCategoriasPorDefecto());
      })
    ).subscribe((categorias: Categoria[]) => {
      console.log('Categorías cargadas:', categorias);
      this.categoriasSource.next(categorias);
    });
  }

  /* Devuelve un arreglo de categorías por defecto en caso de error al cargar desde backend. */
  private obtenerCategoriasPorDefecto(): Categoria[] {
    return [

    ];
  }

  getCategorias(): Observable<Categoria[]> {
    return this.categorias$;
  }

  getCategoriaPorId(id: number): Observable<Categoria | undefined> {
    return this.categorias$.pipe(
      map(categorias => categorias.find(categoria => categoria.id === id))
    );
  }

  /* Obtiene una categoría por ID directamente desde el backend.
  Si ocurre un error, retorna undefined.*/
  getCategoriaPorIdFromBackend(id: number): Observable<Categoria | undefined> {
    return this.categoriaApiService.getCategoriaById(id).pipe(
      map((categoria: any) => categoria as Categoria),
      catchError((error: any) => {
        console.error('Error obteniendo categoría por ID desde backend:', error);
        return of(undefined);
      })
    );
  }

  refreshCategorias(): void {
    console.log('Refrescando categorías...');
    this.cargarCategoriasIniciales();
  }

  buscarCategorias(termino: string): Observable<Categoria[]> {
    return this.categorias$.pipe(
      map(categorias =>
        categorias.filter(categoria =>
          categoria.nombre.toLowerCase().includes(termino.toLowerCase())
        )
      )
    );
  }

  getCategoriasActuales(): Categoria[] {
    return this.categoriasSource.value;
  }
}