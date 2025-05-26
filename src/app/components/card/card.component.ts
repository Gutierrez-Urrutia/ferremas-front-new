import { Component, Input } from '@angular/core';
import { Producto } from '../../interfaces/producto';
import { CommonModule } from '@angular/common';
import { CompraService } from '../../services/compra.service';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() producto!: Producto;

  constructor(
    private compraService: CompraService,
    private carritoService: CarritoService
  ) {}

  onMostrar() {
    this.compraService.iniciarCompra(this.producto);
  }

  onAgregarAlCarrito() {
    this.carritoService.agregarProducto(this.producto, 1);
    
    // Mostrar notificación temporal
    this.mostrarNotificacion();
  }

  private mostrarNotificacion() {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'alert alert-success position-fixed';
    notificacion.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    notificacion.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>
      Producto agregado al carrito
    `;

    document.body.appendChild(notificacion);

    // Mostrar notificación
    setTimeout(() => {
      notificacion.style.opacity = '1';
    }, 100);

    // Ocultar y remover notificación
    setTimeout(() => {
      notificacion.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notificacion);
      }, 300);
    }, 2000);
  }
}