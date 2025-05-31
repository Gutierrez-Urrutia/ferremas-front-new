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
  // Fuente de datos reactiva que mantiene el estado actual del carrito.
  private itemsCarritoSource = new BehaviorSubject<ItemCarrito[]>([]);
  // Observable para suscribirse a los cambios en el carrito.
  itemsCarrito$ = this.itemsCarritoSource.asObservable();

  private readonly CARRITO_KEY = 'carrito_ferremas';

  constructor() {
    this.cargarCarritoDesdeStorage();
  }

  /* Obtiene el precio del producto desde el primer elemento del arreglo de precios.
  Si no hay precios, retorna 0. */
  private getPrecioProducto(producto: Producto): number {
    if (!producto.precios || producto.precios.length === 0) {
      return 0;
    }
    return producto.precios[0].precio;
  }

  /* Carga el carrito desde localStorage y recalcula los subtotales
  en caso de que el precio del producto haya cambiado.*/
  private cargarCarritoDesdeStorage(): void {
    try {
      const carritoGuardado = localStorage.getItem(this.CARRITO_KEY);
      if (carritoGuardado) {
        const items = JSON.parse(carritoGuardado);
        
        items.forEach((item: ItemCarrito) => {
          item.subtotal = this.getPrecioProducto(item.producto) * item.cantidad;
        });
        this.itemsCarritoSource.next(items);
      }
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
    }
  }

  /* Guarda el estado actual del carrito en localStorage. */
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
    const precio = this.getPrecioProducto(producto);

    if (itemExistente) {
      // Si el producto ya existe en el carrito, solo actualiza la cantidad y el subtotal
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = this.getPrecioProducto(itemExistente.producto) * itemExistente.cantidad;
    } else {
      // Si el producto no existe, lo agrega como un nuevo item
      const nuevoItem: ItemCarrito = {
        producto,
        cantidad,
        subtotal: precio * cantidad
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
      item.subtotal = this.getPrecioProducto(item.producto) * nuevaCantidad;
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

  /* Calcula el total del carrito sumando los subtotales de todos los items.
  Se asegura de recalcular el subtotal por si el precio del producto cambió. */
  obtenerTotal(): number {
    return this.itemsCarritoSource.value.reduce((total, item) => {
      const precio = this.getPrecioProducto(item.producto);
      const subtotal = precio * item.cantidad;
      return total + subtotal;
    }, 0);
  }

  obtenerItems(): ItemCarrito[] {
    return this.itemsCarritoSource.value;
  }
}