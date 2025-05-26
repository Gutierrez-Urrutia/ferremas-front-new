import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Categoria } from '../interfaces/categoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private categoriasSource = new BehaviorSubject<Categoria[]>([]);
  categorias$ = this.categoriasSource.asObservable();

  private categorias: Categoria[] = [
    { id: 1, nombre: 'Herramientas manuales' },
    { id: 2, nombre: 'Materiales básicos' },
    { id: 3, nombre: 'Equipos de seguridad' },
    { id: 4, nombre: 'Tornillos y anclajes' },
    { id: 5, nombre: 'Fijaciones y adhesivos' },
    { id: 6, nombre: 'Equipos de medición' }
  ];

  constructor() {
    this.categoriasSource.next(this.categorias);
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
    return new Observable<Categoria | undefined>(observer => {
      observer.next(this.categorias.find(categoria => categoria.id === id));
      observer.complete();
    });
  }
}