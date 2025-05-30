import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompraService } from '../../services/compra.service';
import { DatosCompra } from '../../interfaces/datos-compra';
import { CarritoService } from '../../services/carrito.service';
import { SimularPagoComponent } from '../../pages/simular-pago/simular-pago.component';
import { ConversorPipe } from '../../pipes/conversor.pipe';
import Swal from 'sweetalert2';
import { Producto } from '../../interfaces/producto';

@Component({
  selector: 'app-modal-compra',
  imports: [CommonModule, FormsModule, SimularPagoComponent, ConversorPipe],
  templateUrl: './modal-compra.component.html',
  styleUrl: './modal-compra.component.css'
})
export class ModalCompraComponent implements OnInit {
  compra: DatosCompra | null = null;
  cantidad: number = 1;
  paso: number = 1;
  numeroOrden: string = '';
  valorDespacho: number = 3000;

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
    // Suscribirse a los cambios en la compra actual y limpiar el formulario cuando sea necesario
    this.compraService.compraActual$.subscribe(compra => {
      if (compra) {
        this.compra = compra;
        if (!compra.esCompraCarrito && compra.productos.length > 0) {
          this.cantidad = compra.productos[0].cantidad;
          // Verificar que la cantidad no exceda el stock disponible
          if (this.cantidad > this.getStockDisponible()) {
            this.cantidad = this.getStockDisponible();
            this.actualizarCantidad();
          }
        }
      }
    });
    this.compraService.limpiarFormulario$.subscribe(() => {
      this.limpiarFormularioCliente();
    });
  }

  getPrecioActual(producto: Producto): number {
    if (!producto.precios || producto.precios.length === 0) {
      return 0;
    }
    return producto.precios[0].precio;
  }

  // Nuevo método: obtiene el stock disponible del producto
  getStockDisponible(): number {
    if (this.compra && !this.compra.esCompraCarrito && this.compra.productos.length > 0) {
      return this.compra.productos[0].producto.stock || 0;
    }
    return 0;
  }

  // Nuevo método: verifica si mostrar el aviso de stock
  mostrarAvisoStock(): boolean {
    return !this.compra?.esCompraCarrito && this.cantidad >= this.getStockDisponible() && this.getStockDisponible() > 0;
  }

  // Nuevo método: aumentar cantidad
  aumentarCantidad() {
    if (this.cantidad < this.getStockDisponible()) {
      this.cantidad++;
      this.actualizarCantidad();
    }
  }

  // Nuevo método: disminuir cantidad
  disminuirCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
      this.actualizarCantidad();
    }
  }

  limpiarFormularioCliente() {
    this.datosCliente = {
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      region: ''
    };
    this.tipoDespacho = 'domicilio';
    this.cantidad = 1;
    this.paso = 1;
  }

  actualizarCantidad() {
    // Asegurar que la cantidad esté dentro del rango válido
    if (this.cantidad < 1) {
      this.cantidad = 1;
    }
    if (this.cantidad > this.getStockDisponible()) {
      this.cantidad = this.getStockDisponible();
    }
    
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
      // Alerta de validación con SweetAlert2 si faltan datos obligatorios
      Swal.fire({
        title: 'Datos incompletos',
        text: 'Por favor, complete todos los campos obligatorios.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
    }
  }

  procesarPago() {
    // Genera un número de orden aleatorio para la compra
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

      // Mostrar alerta de éxito y cerrar modal en el callback
      this.mostrarAlertaExito();
    } else {
      // Alerta de pago rechazado con SweetAlert2 y volver al resumen
      Swal.fire({
        title: 'Pago rechazado',
        text: 'Su pago no pudo ser procesado. Volviendo al resumen de compra.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc3545'
      }).then(() => {
        this.paso = 3;
      });
      return;
    }
  }

  mostrarAlertaExito() {
    Swal.fire({
      title: '¡Compra exitosa!',
      text: 'Su pago ha sido procesado correctamente',
      icon: 'success',
      confirmButtonText: 'Ir al inicio',
      confirmButtonColor: '#28a745',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      console.log('Resultado SweetAlert:', result);

      this.limpiarTodosLosDatos();
      this.cerrarModal();

      if (result.isConfirmed) {
        console.log('Navegando al home...');
        this.router.navigate(['/']).then(success => {
          console.log('Navegación exitosa:', success);
        }).catch(error => {
          console.error('Error en navegación:', error);
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

  limpiarTodosLosDatos() {
    // Vacía el carrito y limpia la compra actual
    this.carritoService.vaciarCarrito();
    this.compraService.limpiarCompra();
  }
}