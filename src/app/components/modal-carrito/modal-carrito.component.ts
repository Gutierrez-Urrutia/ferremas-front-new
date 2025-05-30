import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';
import { CompraService } from '../../services/compra.service';
import { ConversorPipe } from '../../pipes/conversor.pipe';
import { Producto } from '../../interfaces/producto';
import Swal from 'sweetalert2';

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
    // Suscribe a los cambios en el carrito para actualizar la lista de items y el total
    this.carritoService.itemsCarrito$.subscribe(items => {
      this.items = items;
      this.total = this.carritoService.obtenerTotal();
    });
  }

  getPrecioActual(producto: Producto): number {
    // Retorna el precio actual del producto (primer precio disponible)
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
    // Muestra un diálogo de confirmación antes de vaciar el carrito
    Swal.fire({
      title: '¿Vaciar carrito?',
      text: 'Se eliminarán todos los productos del carrito',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.carritoService.vaciarCarrito();
        Swal.fire({
          title: '¡Carrito vaciado!',
          text: 'Todos los productos han sido eliminados',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  procederACompra(): void {
    if (this.items.length === 0) {
      alert('No hay productos en el carrito');
      return;
    }

    // Inicia el proceso de compra con los productos actuales del carrito
    this.compraService.iniciarCompraDesdeCarrito(this.items);

    // Oculta el modal del carrito y muestra el modal de compra
    const modalElement = document.getElementById('modalCarrito');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }

    setTimeout(() => {
      const modalCompra = new (window as any).bootstrap.Modal(document.getElementById('modalCompra'));
      modalCompra.show();
    }, 300);
  }

  trackByProductoId(index: number, item: ItemCarrito): number {
    return item.producto.id;
  }
}