import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RegionComunaService {
  private readonly baseUrl = 'http://localhost:8090/api/v1';

  constructor(private http: HttpClient) {}

  getRegiones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/regiones`);
  }

  getComunasPorRegion(regionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/comunas/region/${regionId}`);
  }
}
