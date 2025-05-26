import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
    { path: 'categoria/:id', loadComponent: () => import('./pages/categoria-producto/categoria-producto.component').then(m => m.CategoriaProductoComponent) },
    { path: '**', redirectTo:''}
];
