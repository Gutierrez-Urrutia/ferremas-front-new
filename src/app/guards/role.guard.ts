import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['requiredRole'];
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/iniciar-sesion']);
      return false;
    }

    // Los administradores pueden acceder a cualquier ruta
    if (this.authService.isAdmin()) {
      return true;
    }

    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      this.router.navigate(['/']); // Redireccionar al home si no tiene el rol
      return false;
    }

    return true;
  }
}
