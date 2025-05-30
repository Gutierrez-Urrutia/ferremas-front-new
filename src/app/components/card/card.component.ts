import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompraService } from '../../services/compra.service';
import { CarritoService } from '../../services/carrito.service';
import { ConversorPipe } from '../../pipes/conversor.pipe';
import { Producto } from '../../interfaces/producto';

@Component({
  selector: 'app-card',
  imports: [CommonModule, ConversorPipe],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() producto!: Producto;

  constructor(
    private compraService: CompraService,
    private carritoService: CarritoService
  ) { }

  onMostrar() {
    this.compraService.iniciarCompra(this.producto);
  }

  onAgregarAlCarrito() {
    this.carritoService.agregarProducto(this.producto, 1);
    this.mostrarNotificacion();
  }

  getPrecioActual(): number {
    if (!this.producto.precios || this.producto.precios.length === 0) {
      return 0;
    }
    return this.producto.precios[0].precio;
  }

  private mostrarNotificacion() {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'alert alert-success toast-notification';
    notificacion.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>
    Producto agregado al carrito
  `;

    document.body.appendChild(notificacion);

    // Mostrar notificación
    setTimeout(() => {
      notificacion.classList.add('show');
    }, 50);

    // Ocultar y remover notificación
    setTimeout(() => {
      notificacion.classList.remove('show');
      setTimeout(() => {
        if (notificacion.parentNode) {
          document.body.removeChild(notificacion);
        }
      }, 300);
    }, 2000);
  }
  
}