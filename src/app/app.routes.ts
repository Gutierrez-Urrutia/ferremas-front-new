import { Routes } from '@angular/router';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
    { path: 'categoria/:id', loadComponent: () => import('./pages/categoria-producto/categoria-producto.component').then(m => m.CategoriaProductoComponent) },
    { path: 'marca/:id', loadComponent: () => import('./pages/marca-producto/marca-producto.component').then(m => m.MarcaProductoComponent) },
    { path: 'registro', loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent)},
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)},
    { path: 'ofertas', loadComponent: () => import('./pages/oferta-producto/oferta-producto.component').then(m => m.OfertaProductoComponent) },
    
    // Rutas protegidas por rol
    { 
        path: 'ventas', 
        loadComponent: () => import('./pages/ventas/ventas.component').then(m => m.VentasComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'VENDEDOR' }
    },
    { 
        path: 'bodega', 
        loadComponent: () => import('./pages/bodega/bodega.component').then(m => m.BodegaComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'BODEGUERO' }
    },
    { 
        path: 'auditor', 
        loadComponent: () => import('./pages/auditor/auditor.component').then(m => m.AuditorComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'AUDITOR' }
    },
    { 
        path: 'admin', 
        loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'ADMIN' }
    },
    
    { path: '**', redirectTo:''}
];
