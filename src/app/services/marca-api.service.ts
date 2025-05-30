import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Marca } from "../interfaces/marca";

@Injectable({
  providedIn: 'root'
})
export class MarcaApiService {
  private readonly baseUrl = 'http://localhost:8090/api/v1';
  
  constructor(private http: HttpClient){
  }

  getMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.baseUrl}/marcas`);
  } 

  getMarcaById(id: number): Observable<Marca> {
    return this.http.get<Marca>(`${this.baseUrl}/marcas/${id}`);
  }

  createMarca(marca: Marca): Observable<Marca> {
    return this.http.post<Marca>(`${this.baseUrl}/marcas`, marca);
  }

  updateMarca(id: number, marca: Marca): Observable<Marca> {
    return this.http.put<Marca>(`${this.baseUrl}/marcas/${id}`, marca);
  }

  deleteMarca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/marcas/${id}`);
  }
}