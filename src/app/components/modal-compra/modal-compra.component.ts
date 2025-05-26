import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompraService } from '../../services/compra.service';
import { DatosCompra } from '../../interfaces/datos-compra';
import { CarritoService } from '../../services/carrito.service';
import { SimularPagoComponent } from '../../pages/simular-pago/simular-pago.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-compra',
  imports: [CommonModule, FormsModule, SimularPagoComponent],
  templateUrl: './modal-compra.component.html',
  styleUrl: './modal-compra.component.css'
})
export class ModalCompraComponent implements OnInit {
  compra: DatosCompra | null = null;
  cantidad: number = 1;
  paso: number = 1;
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

  constructor(
    private compraService: CompraService,
    private carritoService: CarritoService,
    private router: Router
  ) { }

  ngOnInit() {
    this.compraService.compraActual$.subscribe(compra => {
      if (compra) {
        this.compra = compra;
        if (!compra.esCompraCarrito && compra.productos.length > 0) {
          this.cantidad = compra.productos[0].cantidad;
        }
      }
    });
  }

  actualizarCantidad() {
    if (this.cantidad >= 1 && this.compra && !this.compra.esCompraCarrito) {
      this.compraService.actualizarCantidad(this.cantidad);
    }
  }

  continuarPaso2() {
    this.paso = 2;
  }

  continuarPaso3() {
    if (this.validarDatosCliente()) {
      this.compraService.actualizarDatosCliente(this.datosCliente);
      this.compraService.actualizarTipoDespacho(this.tipoDespacho);
      this.paso = 3;
    } else {
      alert('Por favor, complete todos los campos obligatorios.');
    }
  }

  procesarPago() {
    this.numeroOrden = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    this.paso = 4;
  }

  volver() {
    if (this.paso > 1) {
      this.paso--;
    }
  }

  cerrarModal() {
    this.paso = 1;
    this.compraService.limpiarCompra();
    // Cerrar modal usando Bootstrap
    const modalElement = document.getElementById('modalCompra');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  onPagoCompletado(exito: boolean) {
    if (exito) {
      // Si la compra es desde el carrito, vaciarlo
      const compra = this.compraService.getCompraActual();
      if (compra?.esCompraCarrito) {
        this.carritoService.vaciarCarrito();
      }

      // Mostrar alerta PRIMERO, luego cerrar modal en el callback
      this.mostrarAlertaExito();
    } else {
      alert('Pago rechazado. Volviendo al resumen de compra.');
      this.paso = 3;
      return;
    }
  }

  mostrarAlertaExito() {
    Swal.fire({
      title: '¡Compra exitosa!',
      text: 'Su pago ha sido procesado correctamente',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Ir al inicio',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#28a745',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      console.log('Resultado SweetAlert:', result);

      // Cerrar modal DESPUÉS de que el usuario haga clic
      this.cerrarModal();

      if (result.isConfirmed) {
        console.log('Navegando al home...');
        this.router.navigate(['/']).then(success => {
          console.log('Navegación exitosa:', success);
        }).catch(error => {
          console.error('Error en navegación:', error);
          // Fallback: recargar la página en home
          window.location.href = '/';
        });
      }
    });
  }

  validarDatosCliente(): boolean {
    return this.datosCliente.nombre.trim() !== '' &&
      this.datosCliente.email.trim() !== '' &&
      this.datosCliente.telefono.trim() !== '' &&
      this.datosCliente.direccion.trim() !== '' &&
      this.datosCliente.ciudad.trim() !== '' &&
      this.datosCliente.region.trim() !== '';
  }

  getTotal(): number {
    if (!this.compra) return 0;
    let total = this.compra.subtotal;
    if (this.tipoDespacho === 'domicilio') {
      total += this.costoDespacho;
    }
    return total;
  }
}