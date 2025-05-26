import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { CarritoService } from '../../services/carrito.service';
import { Categoria } from '../../interfaces/categoria';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  categorias: Categoria[] = [];
  cantidadCarrito: number = 0;

  constructor(
    private categoriaService: CategoriaService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.categoriaService.getCategorias().subscribe(categorias => {
      this.categorias = categorias;
    });

    // Suscribirse a cambios en el carrito
    this.carritoService.itemsCarrito$.subscribe(items => {
      this.cantidadCarrito = this.carritoService.obtenerCantidadTotal();
    });
  }
}