import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleRedirectGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const userRole = this.authService.getUserRole();
    if (!userRole) {
      this.router.navigate(['/login']);
      return false;
    }

    const currentPath = route.routeConfig?.path;

    // Definir las rutas permitidas para cada rol
    const roleRoutes: { [key: string]: string[] } = {
      'ADMIN': ['admin', 'ventas', 'bodega', 'auditor'], // Admin puede acceder a todas las vistas administrativas
      'VENDEDOR': ['ventas'], // Solo puede acceder a ventas
      'BODEGUERO': ['bodega'], // Solo puede acceder a bodega
      'AUDITOR': ['auditor'], // Solo puede acceder a auditor
      'CLIENTE': [] // Cliente no puede acceder a vistas administrativas
    };

    // Verificar si el usuario tiene acceso a la ruta actual
    const allowedRoutes = roleRoutes[userRole] || [];
    
    if (!allowedRoutes.includes(currentPath || '')) {
      // Redirigir al usuario a su vista específica o al home
      this.redirectToUserHome(userRole);
      return false;
    }

    return true;
  }

  private redirectToUserHome(role: string): void {
    switch (role) {
      case 'VENDEDOR':
        this.router.navigate(['/ventas']);
        break;
      case 'BODEGUERO':
        this.router.navigate(['/bodega']);
        break;
      case 'AUDITOR':
        this.router.navigate(['/auditor']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }
}
