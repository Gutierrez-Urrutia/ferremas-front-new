import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Categoria } from '../interfaces/categoria';
import { CategoriaApiService } from './categoria-api.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private categoriasSource = new BehaviorSubject<Categoria[]>([]);
  categorias$ = this.categoriasSource.asObservable();

  constructor(private categoriaApiService: CategoriaApiService) {
    this.cargarCategoriasIniciales();
  }

  private cargarCategoriasIniciales(): void {
    console.log('🔄 Cargando categorías desde backend...');

    this.categoriaApiService.getCategorias().pipe(
      // CORRECCIÓN: Agregar tipado explícito al map
      map((categorias: any) => categorias as Categoria[]),
      catchError((error: any) => {
        console.error('❌ Error cargando categorías desde backend:', error);
        console.warn('⚠️ Usando categorías por defecto');
        return of(this.obtenerCategoriasPorDefecto());
      })
    ).subscribe((categorias: Categoria[]) => {
      console.log('✅ Categorías cargadas:', categorias);
      this.categoriasSource.next(categorias);
    });
  }

  private obtenerCategoriasPorDefecto(): Categoria[] {
    return [
      
    ];
  }

  /**
   * Obtiene todas las categorías disponibles
   */
  getCategorias(): Observable<Categoria[]> {
    return this.categorias$;
  }

  /**
   * Obtiene una categoría específica por su ID
   */
  getCategoriaPorId(id: number): Observable<Categoria | undefined> {
    return this.categorias$.pipe(
      map(categorias => categorias.find(categoria => categoria.id === id))
    );
  }

  /**
   * Obtiene una categoría específica desde el backend por su ID
   */
  getCategoriaPorIdFromBackend(id: number): Observable<Categoria | undefined> {
    return this.categoriaApiService.getCategoriaById(id).pipe(
      map((categoria: any) => categoria as Categoria),
      catchError((error: any) => {
        console.error('❌ Error obteniendo categoría por ID desde backend:', error);
        return of(undefined);
      })
    );
  }

  /**
   * Refrescar categorías desde el backend
   */
  refreshCategorias(): void {
    console.log('🔄 Refrescando categorías...');
    this.cargarCategoriasIniciales();
  }

  /**
   * Buscar categorías por nombre
   */
  buscarCategorias(termino: string): Observable<Categoria[]> {
    return this.categorias$.pipe(
      map(categorias =>
        categorias.filter(categoria =>
          categoria.nombre.toLowerCase().includes(termino.toLowerCase())
        )
      )
    );
  }

  /**
   * Obtener categorías actuales (sincrono)
   */
  getCategoriasActuales(): Categoria[] {
    return this.categoriasSource.value;
  }
}