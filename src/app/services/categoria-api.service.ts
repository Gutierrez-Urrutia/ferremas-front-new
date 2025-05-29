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

  getCategorias(){
    return this.http.get(`${this.baseUrl}/categorias`);
  }

  getCategoriaById(id: number){
    return this.http.get(`${this.baseUrl}/categorias/${id}`);
  }

   // Si tu backend tiene estos endpoints adicionales
  createCategoria(categoria: any): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.baseUrl}/categorias`, categoria);
  }

  updateCategoria(id: number, categoria: any): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/categorias/${id}`, categoria);
  }

  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categorias/${id}`);
  }
}
