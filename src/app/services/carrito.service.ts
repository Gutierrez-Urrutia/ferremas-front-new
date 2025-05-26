import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../interfaces/producto';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private itemsCarritoSource = new BehaviorSubject<ItemCarrito[]>([]);
  itemsCarrito$ = this.itemsCarritoSource.asObservable();

  private readonly CARRITO_KEY = 'carrito_ferremas';

  constructor() {
    this.cargarCarritoDesdeStorage();
  }

  private cargarCarritoDesdeStorage(): void {
    try {
      const carritoGuardado = localStorage.getItem(this.CARRITO_KEY);
      if (carritoGuardado) {
        const items = JSON.parse(carritoGuardado);
        this.itemsCarritoSource.next(items);
      }
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
    }
  }

  private guardarCarritoEnStorage(): void {
    try {
      const items = this.itemsCarritoSource.value;
      localStorage.setItem(this.CARRITO_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar carrito en localStorage:', error);
    }
  }

  agregarProducto(producto: Producto, cantidad: number = 1): void {
    const itemsActuales = this.itemsCarritoSource.value;
    const itemExistente = itemsActuales.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      // Si el producto ya existe, aumentar la cantidad
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.producto.precio * itemExistente.cantidad;
    } else {
      // Si no existe, agregarlo como nuevo item
      const nuevoItem: ItemCarrito = {
        producto,
        cantidad,
        subtotal: producto.precio * cantidad
      };
      itemsActuales.push(nuevoItem);
    }

    this.itemsCarritoSource.next(itemsActuales);
    this.guardarCarritoEnStorage();
  }

  actualizarCantidad(productoId: number, nuevaCantidad: number): void {
    const itemsActuales = this.itemsCarritoSource.value;
    const item = itemsActuales.find(item => item.producto.id === productoId);

    if (item && nuevaCantidad > 0) {
      item.cantidad = nuevaCantidad;
      item.subtotal = item.producto.precio * nuevaCantidad;
      this.itemsCarritoSource.next(itemsActuales);
      this.guardarCarritoEnStorage();
    }
  }

  eliminarProducto(productoId: number): void {
    const itemsActuales = this.itemsCarritoSource.value;
    const nuevosItems = itemsActuales.filter(item => item.producto.id !== productoId);
    this.itemsCarritoSource.next(nuevosItems);
    this.guardarCarritoEnStorage();
  }

  vaciarCarrito(): void {
    this.itemsCarritoSource.next([]);
    localStorage.removeItem(this.CARRITO_KEY);
  }

  obtenerCantidadTotal(): number {
    return this.itemsCarritoSource.value.reduce((total, item) => total + item.cantidad, 0);
  }

  obtenerTotal(): number {
    return this.itemsCarritoSource.value.reduce((total, item) => total + item.subtotal, 0);
  }

  obtenerItems(): ItemCarrito[] {
    return this.itemsCarritoSource.value;
  }
}