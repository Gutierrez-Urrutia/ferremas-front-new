import { Component } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/card/card.component';
import { ProductoResponse } from '../../interfaces/producto-response';

@Component({
  selector: 'app-oferta-producto',
  imports: [CommonModule, CardComponent],
  templateUrl: './oferta-producto.component.html',
  styleUrl: './oferta-producto.component.css'
})
export class OfertaProductoComponent {
  productos: ProductoResponse[] = [];
  loading = true;
  error = '';

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.cargarProductosConDescuento();
  }

  cargarProductosConDescuento(): void {
    this.loading = true;
    this.productoService.getProductosConDescuento().subscribe({
      next: (productos) => {
        this.productos = productos;
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
