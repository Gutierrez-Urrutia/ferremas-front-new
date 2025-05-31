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

  // Método mejorado para actualizar cantidad con validación de stock
  actualizarCantidad(productoId: number, nuevaCantidad: number): void {
    const item = this.items.find(item => item.producto.id === productoId);
    if (!item) return;

    // Validar que la cantidad esté dentro del rango permitido
    if (nuevaCantidad < 1) {
      nuevaCantidad = 1;
    }
    
    const stockDisponible = item.producto.stock || 99;
    if (nuevaCantidad > stockDisponible) {
      nuevaCantidad = stockDisponible;
      this.mostrarMensajeStockLimitado(stockDisponible);
    }

    if (nuevaCantidad > 0) {
      this.carritoService.actualizarCantidad(productoId, nuevaCantidad);
    }
  }

  // Nuevo método: aumentar cantidad con validación de stock
  aumentarCantidad(productoId: number, cantidadActual: number): void {
    const item = this.items.find(item => item.producto.id === productoId);
    if (!item) return;

    const stockDisponible = item.producto.stock || 99;
    if (cantidadActual < stockDisponible) {
      this.carritoService.actualizarCantidad(productoId, cantidadActual + 1);
    }
  }

  // Nuevo método: disminuir cantidad
  disminuirCantidad(productoId: number, cantidadActual: number): void {
    if (cantidadActual > 1) {
      this.carritoService.actualizarCantidad(productoId, cantidadActual - 1);
    }
  }

  // Nuevo método: verificar si mostrar aviso de stock
  mostrarAvisoStock(item: ItemCarrito): boolean {
    const stockDisponible = item.producto.stock || 0;
    return item.cantidad >= stockDisponible && stockDisponible > 0;
  }

  // Nuevo método: mostrar mensaje cuando se alcanza el límite de stock
  private mostrarMensajeStockLimitado(stock: number): void {
    Swal.fire({
      title: 'Stock limitado',
      text: `Solo hay ${stock} unidades disponibles de este producto`,
      icon: 'warning',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
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

    // Verificar si hay productos agotados en el carrito
    const productosAgotados = this.items.filter(item => item.producto.stock === 0);
    if (productosAgotados.length > 0) {
      Swal.fire({
        title: 'Productos agotados',
        text: 'Hay productos sin stock en tu carrito. Por favor, elimínalos antes de continuar.',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Verificar si algún producto excede el stock disponible
    const productosExcedidos = this.items.filter(item => 
      item.cantidad > (item.producto.stock || 0) && item.producto.stock > 0
    );
    
    if (productosExcedidos.length > 0) {
      Swal.fire({
        title: 'Cantidad excede stock',
        text: 'Algunos productos tienen cantidades que exceden el stock disponible. Se ajustarán automáticamente.',
        icon: 'info',
        confirmButtonText: 'Continuar'
      }).then(() => {
        // Ajustar cantidades automáticamente
        productosExcedidos.forEach(item => {
          this.carritoService.actualizarCantidad(item.producto.id, item.producto.stock);
        });
        this.procederConCompra();
      });
      return;
    }

    this.procederConCompra();
  }

  private procederConCompra(): void {
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