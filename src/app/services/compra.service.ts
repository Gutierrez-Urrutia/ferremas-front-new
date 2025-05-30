import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DatosCompra } from '../interfaces/datos-compra';
import { DatosCliente } from '../interfaces/datos-cliente';
import { ItemCarrito } from './carrito.service';
import { ProductoResponse } from '../interfaces/producto-response';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private compraActualSource = new BehaviorSubject<DatosCompra | null>(null);
  compraActual$ = this.compraActualSource.asObservable();

  private limpiarFormularioSource = new Subject<void>();
  limpiarFormulario$ = this.limpiarFormularioSource.asObservable();

  iniciarCompra(producto: ProductoResponse, cantidad: number = 1) {
    const compra: DatosCompra = {
      productos: [{ producto, cantidad }],
      subtotal: this.getPrecioProducto(producto) * cantidad,
      esCompraCarrito: false
    };
    this.compraActualSource.next(compra);
  }

  private getPrecioProducto(producto: ProductoResponse): number {
    if (!producto.precios || producto.precios.length === 0) {
      return 0;
    }
    return producto.precios[0].precio;
  }

  iniciarCompraDesdeCarrito(items: ItemCarrito[]) {
    const productos = items.map(item => ({
      producto: item.producto,
      cantidad: item.cantidad
    }));
    
    const subtotal = productos.reduce((total, item) => {
      return total + (this.getPrecioProducto(item.producto) * item.cantidad);
    }, 0);
    
    const compra: DatosCompra = {
      productos,
      subtotal,
      esCompraCarrito: true
    };
    this.compraActualSource.next(compra);
  }

  actualizarCantidad(cantidad: number) {
    const compraActual = this.compraActualSource.value;
    if (compraActual && !compraActual.esCompraCarrito) {
      const producto = compraActual.productos[0];
      if (producto) {
        producto.cantidad = cantidad;
        compraActual.subtotal = this.getPrecioProducto(producto.producto) * cantidad;
        this.compraActualSource.next(compraActual);
      }
    }
  }

  actualizarDatosCliente(datos: DatosCliente) {
    const compraActual = this.compraActualSource.value;
    if (compraActual) {
      compraActual.datosCliente = datos;
      this.compraActualSource.next(compraActual);
    }
  }

  actualizarTipoDespacho(tipo: string) {
    const compraActual = this.compraActualSource.value;
    if (compraActual) {
      compraActual.tipoDespacho = tipo;
      this.compraActualSource.next(compraActual);
    }
  }

  getCompraActual(): DatosCompra | null {
    return this.compraActualSource.value;
  }

  limpiarCompra() {
    this.compraActualSource.next(null);
    this.limpiarFormularioSource.next();
  }
}