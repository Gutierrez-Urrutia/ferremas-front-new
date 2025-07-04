import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RestrictedRoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      return true; // Permitir acceso a usuarios no autenticados
    }

    const userRole = this.authService.getUserRole();
    
    // Si el usuario tiene un rol administrativo restringido, redirigir a su vista específica
    switch (userRole) {
      case 'VENDEDOR':
        this.router.navigate(['/ventas']);
        return false;
      case 'BODEGUERO':
        this.router.navigate(['/bodega']);
        return false;
      case 'AUDITOR':
        this.router.navigate(['/auditor']);
        return false;
      case 'ADMIN':
        // Admin puede navegar libremente
        return true;
      case 'CLIENTE':
        // Cliente puede acceder a rutas públicas
        return true;
      default:
        return true;
    }
  }
}
