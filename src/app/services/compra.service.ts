import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../interfaces/producto';
import { DatosCompra } from '../interfaces/datos-compra';
import { DatosCliente } from '../interfaces/datos-cliente';


@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private compraActualSource = new BehaviorSubject<DatosCompra | null>(null);
  compraActual$ = this.compraActualSource.asObservable();

  iniciarCompra(producto: Producto, cantidad: number = 1) {
    const compra: DatosCompra = {
      producto,
      cantidad,
      subtotal: producto.precio * cantidad
    };
    this.compraActualSource.next(compra);
  }

  actualizarCantidad(cantidad: number) {
    const compraActual = this.compraActualSource.value;
    if (compraActual) {
      compraActual.cantidad = cantidad;
      compraActual.subtotal = compraActual.producto.precio * cantidad;
      this.compraActualSource.next(compraActual);
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
  }
}