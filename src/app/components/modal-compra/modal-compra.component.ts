import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../services/compra.service';
import { DatosCompra } from '../../interfaces/datos-compra';
import { SimularPagoComponent } from '../../pages/simular-pago/simular-pago.component';


@Component({
  selector: 'app-modal-compra',
  imports: [CommonModule, FormsModule, SimularPagoComponent],
  templateUrl: './modal-compra.component.html',
  styleUrl: './modal-compra.component.css'
})
export class ModalCompraComponent implements OnInit {
  compra: DatosCompra | null = null;
  cantidad: number = 1;
  paso: number = 1; // 1: cantidad, 2: datos cliente, 3: pago, 4: simulación transbank
  numeroOrden: string = '';

  // Datos del cliente
  datosCliente = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    region: ''
  };

  tipoDespacho: string = 'domicilio';
  costoDespacho: number = 3000;

  constructor(private compraService: CompraService) {}

  ngOnInit() {
    this.compraService.compraActual$.subscribe(compra => {
      if (compra) {
        this.compra = compra;
        this.cantidad = compra.cantidad;
      }
    });
  }

  actualizarCantidad() {
    if (this.cantidad >= 1) {
      this.compraService.actualizarCantidad(this.cantidad);
    }
  }

  continuarPaso2() {
    this.actualizarCantidad();
    this.paso = 2;
  }

  continuarPaso3() {
    this.compraService.actualizarDatosCliente(this.datosCliente);
    this.compraService.actualizarTipoDespacho(this.tipoDespacho);
    this.paso = 3;
  }

  procesarPago() {
    // Generar número de orden cuando se procesa el pago
    this.numeroOrden = this.generarNumeroOrden();
    this.paso = 4;
  }

  generarNumeroOrden(): string {
    return 'ORD-' + Date.now();
  }

  volver() {
    if (this.paso > 1) {
      this.paso--;
    }
  }

  getTotal(): number {
    if (!this.compra) return 0;
    return this.compra.subtotal + (this.tipoDespacho === 'domicilio' ? this.costoDespacho : 0);
  }

  onPagoCompletado(exito: boolean) {
    if (exito) {
      alert('¡Pago aprobado! Compra realizada con éxito.');
    } else {
      alert('Pago rechazado. Volviendo al resumen de compra.');
      this.paso = 3; // Volver al paso anterior
      return;
    }
    this.cerrarModal();
  }

  cerrarModal() {
    this.paso = 1;
    this.cantidad = 1;
    this.numeroOrden = '';
    this.datosCliente = {
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      region: ''
    };
    this.tipoDespacho = 'domicilio';
    this.compraService.limpiarCompra();
  }
}