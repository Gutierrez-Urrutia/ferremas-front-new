import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { LoginResponse, Usuario } from '../interfaces/usuario';
import { CarritoService } from './carrito.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'ferremas_token';
  private readonly USER_KEY = 'ferremas_user';
  private readonly BASE_URL = 'http://localhost:8090/api/v1/usuarios'; // tu backend

  // Subject para manejar el estado de autenticación
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private carritoService: CarritoService) {
    // Validar y limpiar datos corruptos al inicializar el servicio
    this.validateAndCleanStorage();
    
    // Suscribirse a cambios en el estado de autenticación para actualizar carrito
    this.authStatus$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        // Usuario se autentica: cargar su carrito específico
        const usuario = this.getCurrentUser();
        this.carritoService.recargarCarritoParaUsuario(usuario);
      } else {
        // Usuario se desautentica: limpiar UI pero mantener datos guardados
        this.carritoService.limpiarUI();
      }
    });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.BASE_URL}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        // Guardar el usuario completo que viene del backend
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.usuario));
        
        // Migrar carrito anónimo al usuario autenticado
        this.carritoService.migrarCarritoAnonimo(response.usuario);
        
        // Redirigir automáticamente según el rol del usuario
        this.redirectUserByRole(response.usuario.rol);

        // Notificar cambio de estado de autenticación
        this.authStatusSubject.next(true);
      })
    );
  }

  register(nombre: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/registro`, { nombre, email, password });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Limpiar la UI del carrito pero NO eliminar el carrito guardado del usuario
    this.carritoService.limpiarUI();
    
    // Actualizar el estado de autenticación
    this.authStatusSubject.next(false);
    
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): Usuario | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user || user === 'undefined' || user === 'null') {
      return null;
    }
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.rol : null;
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  isCliente(): boolean {
    return this.hasRole('CLIENTE');
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isVendedor(): boolean {
    return this.hasRole('VENDEDOR');
  }

  isBodeguero(): boolean {
    return this.hasRole('BODEGUERO');
  }

  isAuditor(): boolean {
    return this.hasRole('AUDITOR');
  }

  getUserName(): string {
    const user = this.getCurrentUser();
    return user?.nombre || user?.email || 'Usuario';
  }

  // Método para limpiar datos corruptos del localStorage
  private clearCorruptedData(): void {
    console.warn('Limpiando datos corruptos del localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // this.currentUserSubject.next(null); // Descomentar si se está usando BehaviorSubject para el usuario actual
  }

  // Método para validar y limpiar datos en la inicialización
  private validateAndCleanStorage(): void {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        if (!user || typeof user !== 'object' || !user.id) {
          this.clearCorruptedData();
        }
      }
    } catch (error) {
      console.error('Error validando datos del localStorage:', error);
      this.clearCorruptedData();
    }
  }

  // Método para redirigir al usuario según su rol
  private redirectUserByRole(role: string): void {
    const redirectRoute = this.getRedirectRouteByRole(role);
    this.router.navigate([redirectRoute]);
  }

  // Método para obtener la ruta de redirección según el rol
  private getRedirectRouteByRole(role: string): string {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'VENDEDOR':
        return '/ventas';
      case 'BODEGUERO':
        return '/bodega';
      case 'AUDITOR':
        return '/auditor';
      case 'CLIENTE':
      default:
        return '/'; // Home para clientes y roles no especificados
    }
  }

  // Método público para redirigir al usuario según su rol actual
  redirectToUserDashboard(): void {
    const user = this.getCurrentUser();
    if (user && user.rol) {
      this.redirectUserByRole(user.rol);
    } else {
      this.router.navigate(['/']);
    }
  }
}