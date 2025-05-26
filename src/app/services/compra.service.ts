import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Producto } from '../interfaces/producto';
import { DatosCompra } from '../interfaces/datos-compra';
import { DatosCliente } from '../interfaces/datos-cliente';
import { ItemCarrito } from './carrito.service';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private compraActualSource = new BehaviorSubject<DatosCompra | null>(null);
  compraActual$ = this.compraActualSource.asObservable();

  private limpiarFormularioSource = new Subject<void>();
  limpiarFormulario$ = this.limpiarFormularioSource.asObservable();

  iniciarCompra(producto: Producto, cantidad: number = 1) {
    const compra: DatosCompra = {
      productos: [{ producto, cantidad }],
      subtotal: producto.precio * cantidad,
      esCompraCarrito: false
    };
    this.compraActualSource.next(compra);
  }

  iniciarCompraDesdeCarrito(items: ItemCarrito[]) {
    const productos = items.map(item => ({
      producto: item.producto,
      cantidad: item.cantidad
    }));
    
    const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
    
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
        compraActual.subtotal = producto.producto.precio * cantidad;
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