import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Categoria } from '../interfaces/categoria';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaApiService {
  private readonly baseUrl = 'http://localhost:8090/api/v1';
  constructor(private http: HttpClient) { }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`);
  }

  getCategoriaById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.baseUrl}/categorias/${id}`);
  }

   // Si tu backend tiene estos endpoints adicionales
  createCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.baseUrl}/categorias`, categoria);
  }

  updateCategoria(id: number, categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/categorias/${id}`, categoria);
  }

  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categorias/${id}`);
  }
}
