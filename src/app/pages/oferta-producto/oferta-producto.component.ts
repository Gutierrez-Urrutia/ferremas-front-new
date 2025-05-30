import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/card/card.component';

import { Producto } from '../../interfaces/producto';
import { PaginacionComponent } from '../../components/paginacion/paginacion.component';
import { PaginacionPipe } from '../../pipes/paginacion.pipe';
import { ModalCompraComponent } from '../../components/modal-compra/modal-compra.component';

@Component({
  selector: 'app-oferta-producto',
  imports: [CommonModule, CardComponent, PaginacionComponent, PaginacionPipe, ModalCompraComponent],
  templateUrl: './oferta-producto.component.html',
  styleUrl: './oferta-producto.component.css'
})
export class OfertaProductoComponent implements OnInit {
  productos: Producto[] = [];
  loading = true;
  error = '';
  
  // Variables de paginación
  currentPage = 1;
  itemsPerPage = 8;
  totalItems = 0;

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.cargarProductosConDescuento();
  }

  /*Obtiene los productos desde el servicio y filtra solo aquellos
  que tienen descuento y no están ocultos. Maneja el estado de carga y errores.*/
  cargarProductosConDescuento(): void {
    this.loading = true;
    this.error = '';
    
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        // Filtrar solo productos que tienen descuento > 0 y no están ocultos
        this.productos = productos.filter(producto => 
          producto.descuento > 0 && !producto.oculto
        );
        this.totalItems = this.productos.length;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las ofertas';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}