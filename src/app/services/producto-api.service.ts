import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoResponse } from '../interfaces/producto-response';

@Injectable({
  providedIn: 'root'
})
export class ProductoApiService {

  private readonly baseUrl = 'http://localhost:8090/api/v1';

  constructor(private http: HttpClient) { }

  // Obtener todos los productos
  getProductos(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.baseUrl}/productos`);
  }

  // Obtener producto por ID
  getProductoById(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.baseUrl}/productos/${id}`);
  }

  // Obtener productos por categoría
  getProductosByCategoria(categoriaId: number): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.baseUrl}/productos/categoria/${categoriaId}`);
  }

  // Obtener productos destacados
  getProductosDestacados(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.baseUrl}/productos/destacados`);
  }

  // Obtener productos por marca
  getProductosByMarca(marcaId: number): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.baseUrl}/productos/marca/${marcaId}`);
  }
}
