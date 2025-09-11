import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Obtener headers con token de autorización
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener todos los usuarios (solo para admin)
  getAllUsers(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`, {
      headers: this.getAuthHeaders()
    });
  }

  // Obtener usuario por ID
  getUserById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/usuarios/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Actualizar usuario
  updateUser(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/usuarios/${id}`, usuario, {
      headers: this.getAuthHeaders()
    });
  }

  // Eliminar usuario
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/usuarios/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Cambiar rol de usuario
  changeUserRole(id: number, newRole: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/usuarios/${id}/rol`, 
      { rol: newRole }, 
      { headers: this.getAuthHeaders() }
    );
  }

  // Crear nuevo usuario
  createUser(userData: { nombre: string; email: string; password: string; rol: string }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/usuarios/registro`, userData, {
      headers: this.getAuthHeaders()
    });
  }
}
