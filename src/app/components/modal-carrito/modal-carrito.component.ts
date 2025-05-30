import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';
import { CompraService } from '../../services/compra.service';
import { ConversorPipe } from '../../pipes/conversor.pipe';
import { ProductoResponse } from '../../interfaces/producto-response';

@Component({
  selector: 'app-modal-carrito',
  imports: [CommonModule, FormsModule, ConversorPipe],
  templateUrl: './modal-carrito.component.html',
  styleUrl: './modal-carrito.component.css'
})
export class ModalCarritoComponent implements OnInit {
  items: ItemCarrito[] = [];
  total: number = 0;

  constructor(
    private carritoService: CarritoService,
    private compraService: CompraService
  ) { }

  ngOnInit(): void {
    this.carritoService.itemsCarrito$.subscribe(items => {
      this.items = items;
      this.total = this.carritoService.obtenerTotal();
    });
  }

  getPrecioActual(producto: ProductoResponse): number {
    if (!producto.precios || producto.precios.length === 0) {
      return 0;
    }
    return producto.precios[0].precio;
  }

  actualizarCantidad(productoId: number, nuevaCantidad: number): void {
    if (nuevaCantidad > 0) {
      this.carritoService.actualizarCantidad(productoId, nuevaCantidad);
    }
  }

  eliminarItem(productoId: number): void {
    this.carritoService.eliminarProducto(productoId);
  }

  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.carritoService.vaciarCarrito();
    }
  }

  procederACompra(): void {
    if (this.items.length === 0) {
      alert('No hay productos en el carrito');
      return;
    }

    // Crear una compra con todos los productos del carrito
    this.compraService.iniciarCompraDesdeCarrito(this.items);

    // Cerrar modal del carrito
    const modalElement = document.getElementById('modalCarrito');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }

    // Abrir modal de compra
    setTimeout(() => {
      const modalCompra = new (window as any).bootstrap.Modal(document.getElementById('modalCompra'));
      modalCompra.show();
    }, 300);
  }

  trackByProductoId(index: number, item: ItemCarrito): number {
    return item.producto.id;
  }
}