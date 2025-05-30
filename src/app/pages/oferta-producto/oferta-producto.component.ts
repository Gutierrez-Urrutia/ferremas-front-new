import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/card/card.component';
import { Producto } from '../../interfaces/producto';

@Component({
  selector: 'app-oferta-producto',
  imports: [CommonModule, CardComponent],
  templateUrl: './oferta-producto.component.html',
  styleUrl: './oferta-producto.component.css'
})
export class OfertaProductoComponent implements OnInit {
  productos: Producto[] = [];
  loading = true;
  error = '';

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.cargarProductosConDescuento();
  }

  cargarProductosConDescuento(): void {
    this.loading = true;
    this.error = '';

    this.productoService.getProductos().subscribe({
      next: (productos) => {
        // Filtrar solo productos que tienen descuento > 0
        this.productos = productos.filter(producto =>
          producto.descuento > 0 && !producto.oculto
        );
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las ofertas';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }
}