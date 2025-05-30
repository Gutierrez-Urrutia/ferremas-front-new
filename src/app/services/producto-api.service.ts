import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../interfaces/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoApiService {

  private readonly baseUrl = 'http://localhost:8090/api/v1';

  constructor(private http: HttpClient) { }

  /* 
    Obtiene la lista completa de productos desde la API.
    Retorna un Observable con un arreglo de productos.
  */
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos`);
  }

  /* 
    Busca un producto específico por su ID.
    Retorna un Observable con el producto encontrado.
  */
  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/productos/${id}`);
  }

  /* 
    Obtiene todos los productos que pertenecen a una categoría específica.
    Recibe el ID de la categoría como parámetro.
    Retorna un Observable con un arreglo de productos.
  */
  getProductosByCategoria(categoriaId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/categoria/${categoriaId}`);
  }

  /* 
    Obtiene los productos destacados según la lógica definida en el backend.
    Retorna un Observable con un arreglo de productos destacados.
  */
  getProductosDestacados(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/destacados`);
  }

  /* 
    Obtiene todos los productos asociados a una marca específica.
    Recibe el ID de la marca como parámetro.
    Retorna un Observable con un arreglo de productos.
  */
  getProductosByMarca(marcaId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/marca/${marcaId}`);
  }
}
