import { Routes } from '@angular/router';
import { RoleGuard } from './guards/role.guard';
import { RoleRedirectGuard } from './guards/role-redirect.guard';
import { RestrictedRoleGuard } from './guards/restricted-role.guard';

export const routes: Routes = [
    { 
        path: '', 
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        canActivate: [RestrictedRoleGuard]
    },
    { 
        path: 'categoria/:id', 
        loadComponent: () => import('./pages/categoria-producto/categoria-producto.component').then(m => m.CategoriaProductoComponent),
        canActivate: [RestrictedRoleGuard]
    },
    { 
        path: 'marca/:id', 
        loadComponent: () => import('./pages/marca-producto/marca-producto.component').then(m => m.MarcaProductoComponent),
        canActivate: [RestrictedRoleGuard]
    },
    { 
        path: 'registro', 
        loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent),
        canActivate: [RestrictedRoleGuard]
    },
    { 
        path: 'login', 
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
        canActivate: [RestrictedRoleGuard]
    },
    { 
        path: 'ofertas', 
        loadComponent: () => import('./pages/oferta-producto/oferta-producto.component').then(m => m.OfertaProductoComponent),
        canActivate: [RestrictedRoleGuard]
    },
    
    // Rutas protegidas por rol con redirección automática
    { 
        path: 'ventas', 
        loadComponent: () => import('./pages/ventas/ventas.component').then(m => m.VentasComponent),
        canActivate: [RoleRedirectGuard],
        data: { requiredRole: 'VENDEDOR' }
    },
    { 
        path: 'bodega', 
        loadComponent: () => import('./pages/bodega/bodega.component').then(m => m.BodegaComponent),
        canActivate: [RoleRedirectGuard],
        data: { requiredRole: 'BODEGUERO' }
    },
    { 
        path: 'auditor', 
        loadComponent: () => import('./pages/auditor/auditor.component').then(m => m.AuditorComponent),
        canActivate: [RoleRedirectGuard],
        data: { requiredRole: 'AUDITOR' }
    },
    { 
        path: 'admin', 
        loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
        canActivate: [RoleRedirectGuard],
        data: { requiredRole: 'ADMIN' }
    },
    
    { path: '**', redirectTo:''}
];
