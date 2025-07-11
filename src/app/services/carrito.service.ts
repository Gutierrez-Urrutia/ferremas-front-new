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
  private readonly CARRITO_USER_PREFIX = 'carrito_user_';

  constructor() {
    // Solo cargar carrito inicial si no hay usuario autenticado
    const usuarioActual = this.getUsuarioActual();
    if (!usuarioActual) {
      // Cargar carrito anónimo
      this.cargarCarritoDesdeStorage();
    }
    // Si hay usuario, el AuthService se encargará de cargar su carrito específico
  }

  /* Obtiene el precio del producto desde el primer elemento del arreglo de precios.
  Si no hay precios, retorna 0. */
  private getPrecioProducto(producto: Producto): number {
    if (!producto.precios || producto.precios.length === 0) {
      return 0;
    }
    return producto.precios[0].precio;
  }

  /* Obtiene la clave de almacenamiento específica para el usuario actual */
  private getCarritoKey(usuario?: any): string {
    if (usuario && usuario.id) {
      return `${this.CARRITO_USER_PREFIX}${usuario.id}`;
    }
    return this.CARRITO_KEY; // Fallback para usuarios no autenticados
  }

  /* Helper para obtener el usuario actual desde localStorage sin crear dependencia circular */
  private getUsuarioActual(): any {
    try {
      const userData = localStorage.getItem('ferremas_user');
      if (userData && userData !== 'undefined' && userData !== 'null') {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.warn('Error al obtener usuario actual:', error);
    }
    return null;
  }

  /* Carga el carrito desde localStorage y recalcula los subtotales
  en caso de que el precio del producto haya cambiado.*/
  private cargarCarritoDesdeStorage(usuario?: any): void {
    try {
      const carritoKey = this.getCarritoKey(usuario);
      console.log('Cargando carrito con clave:', carritoKey);
      
      const carritoGuardado = localStorage.getItem(carritoKey);
      if (carritoGuardado) {
        const items = JSON.parse(carritoGuardado);
        console.log('Items encontrados:', items.length);
        
        items.forEach((item: ItemCarrito) => {
          item.subtotal = this.getPrecioProducto(item.producto) * item.cantidad;
        });
        this.itemsCarritoSource.next(items);
      } else {
        console.log('No se encontró carrito para la clave:', carritoKey);
        // Si no hay carrito guardado, mostrar carrito vacío
        this.itemsCarritoSource.next([]);
      }
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
      this.itemsCarritoSource.next([]);
    }
  }

  /* Guarda el estado actual del carrito en localStorage. */
  private guardarCarritoEnStorage(usuario?: any): void {
    try {
      const items = this.itemsCarritoSource.value;
      // Si no se especifica usuario, usar el actual
      const usuarioActual = usuario || this.getUsuarioActual();
      const carritoKey = this.getCarritoKey(usuarioActual);
      console.log('Guardando carrito con clave:', carritoKey);
      localStorage.setItem(carritoKey, JSON.stringify(items));
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

  vaciarCarrito(usuario?: any): void {
    this.itemsCarritoSource.next([]);
    const carritoKey = this.getCarritoKey(usuario);
    localStorage.removeItem(carritoKey);
  }

  /* Método para limpiar solo la UI sin afectar el localStorage */
  limpiarUI(): void {
    this.itemsCarritoSource.next([]);
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

  /* Método público para recargar el carrito cuando cambie el usuario */
  recargarCarritoParaUsuario(usuario?: any): void {
    console.log('Recargando carrito para usuario:', usuario);
    if (usuario) {
      // Usuario específico: cargar su carrito
      this.cargarCarritoDesdeStorage(usuario);
    } else {
      // Sin usuario: cargar carrito anónimo
      this.cargarCarritoDesdeStorage();
    }
  }

  /* Método para migrar carrito anónimo a usuario autenticado */
  migrarCarritoAnonimo(usuario: any): void {
    try {
      // Obtener carrito anónimo
      const carritoAnonimo = localStorage.getItem(this.CARRITO_KEY);
      
      if (carritoAnonimo && usuario && usuario.id) {
        const carritoUserKey = `${this.CARRITO_USER_PREFIX}${usuario.id}`;
        const carritoUsuarioExistente = localStorage.getItem(carritoUserKey);
        
        if (!carritoUsuarioExistente) {
          // Migrar carrito anónimo al usuario
          localStorage.setItem(carritoUserKey, carritoAnonimo);
          console.log('Carrito anónimo migrado al usuario:', usuario.id);
        } else {
          // Si el usuario ya tiene carrito, combinar ambos
          const itemsAnonimos = JSON.parse(carritoAnonimo);
          const itemsUsuario = JSON.parse(carritoUsuarioExistente);
          const itemsCombinados = this.combinarCarritos(itemsUsuario, itemsAnonimos);
          localStorage.setItem(carritoUserKey, JSON.stringify(itemsCombinados));
          console.log('Carritos combinados para usuario:', usuario.id);
        }
        
        // Limpiar carrito anónimo
        localStorage.removeItem(this.CARRITO_KEY);
        
        // Recargar carrito del usuario
        this.recargarCarritoParaUsuario(usuario);
      }
    } catch (error) {
      console.error('Error al migrar carrito anónimo:', error);
    }
  }

  /* Combina dos carritos, sumando cantidades de productos duplicados */
  private combinarCarritos(carritoBase: ItemCarrito[], carritoNuevo: ItemCarrito[]): ItemCarrito[] {
    const carritoResultado = [...carritoBase];
    
    carritoNuevo.forEach(itemNuevo => {
      const itemExistente = carritoResultado.find(item => item.producto.id === itemNuevo.producto.id);
      
      if (itemExistente) {
        // Sumar cantidades
        itemExistente.cantidad += itemNuevo.cantidad;
        itemExistente.subtotal = this.getPrecioProducto(itemExistente.producto) * itemExistente.cantidad;
      } else {
        // Agregar nuevo item
        carritoResultado.push({
          ...itemNuevo,
          subtotal: this.getPrecioProducto(itemNuevo.producto) * itemNuevo.cantidad
        });
      }
    });
    
    return carritoResultado;
  }
}