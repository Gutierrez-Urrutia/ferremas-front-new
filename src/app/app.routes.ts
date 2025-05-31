import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
    { path: 'categoria/:id', loadComponent: () => import('./pages/categoria-producto/categoria-producto.component').then(m => m.CategoriaProductoComponent) },
    { path: 'marca/:id', loadComponent: () => import('./pages/marca-producto/marca-producto.component').then(m => m.MarcaProductoComponent) },
    { path: 'ofertas', loadComponent: () => import('./pages/oferta-producto/oferta-producto.component').then(m => m.OfertaProductoComponent) },
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
    { path: 'registro', loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent) },
    { path: '**', redirectTo:''}
];
