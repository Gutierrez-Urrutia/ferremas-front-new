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

  /* 
    Obtiene la lista completa de marcas desde la API.
    Retorna un observable con un array de objetos Marca.
  */
  getMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.baseUrl}/marcas`);
  } 

  /* 
    Busca una marca específica por su ID.
    Retorna un observable con el objeto Marca correspondiente.
  */
  getMarcaById(id: number): Observable<Marca> {
    return this.http.get<Marca>(`${this.baseUrl}/marcas/${id}`);
  }

  /* 
    Envía una nueva marca para ser creada en la API.
    Retorna un observable con la marca creada.
  */
  createMarca(marca: Marca): Observable<Marca> {
    return this.http.post<Marca>(`${this.baseUrl}/marcas`, marca);
  }

  /* 
    Actualiza una marca existente identificada por su ID.
    Retorna un observable con la marca actualizada.
  */
  updateMarca(id: number, marca: Marca): Observable<Marca> {
    return this.http.put<Marca>(`${this.baseUrl}/marcas/${id}`, marca);
  }

  /* 
    Elimina una marca específica por su ID.
    Retorna un observable vacío cuando la operación es exitosa.
  */
  deleteMarca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/marcas/${id}`);
  }
}