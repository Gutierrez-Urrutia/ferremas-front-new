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

  // Obtener todos los productos
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos`);
  }

  // Obtener producto por ID
  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/productos/${id}`);
  }

  // Obtener productos por categoría
  getProductosByCategoria(categoriaId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/categoria/${categoriaId}`);
  }

  // Obtener productos destacados
  getProductosDestacados(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/destacados`);
  }

  // Obtener productos por marca
  getProductosByMarca(marcaId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/marca/${marcaId}`);
  }
}
