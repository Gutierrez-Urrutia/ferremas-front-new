import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tasa } from '../interfaces/tasa';

@Injectable({
  providedIn: 'root'
})
export class TasasService {

  private readonly baseUrl = 'http://localhost:8090/api/v1';

  constructor(private http: HttpClient) {}

  /* 
    Obtiene la lista de tasas de cambio desde el backend.
    Retorna un Observable que emite un arreglo de objetos Tasa.
  */
  getTasasCambio(): Observable<Tasa[]> {
    return this.http.get<Tasa[]>(`${this.baseUrl}/tasas`);
  }
}