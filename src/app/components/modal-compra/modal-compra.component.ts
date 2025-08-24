import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompraService } from '../../services/compra.service';
import { DatosCompra } from '../../interfaces/datos-compra';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { SimularPagoComponent } from '../../pages/simular-pago/simular-pago.component';
import { ConversorPipe } from '../../pipes/conversor.pipe';
import Swal from 'sweetalert2';
import { Producto } from '../../interfaces/producto';
import { RegionComunaService } from '../../services/region-comuna.service';
import { HttpClient } from '@angular/common/http';
import { Usuario, Direccion } from '../../interfaces/usuario';
import { PedidoService, CrearPedidoRequestBackend, ItemPedidoBackend } from '../../services/pedido.service';

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
    calle: '',
    numero: '',
    comuna: '',
    region: ''
  };

  tipoDespacho: string = 'domicilio';
  costoDespacho: number = 3000;
  datosUsuarioPrecompletados: boolean = false; // Nueva propiedad para controlar readonly
  regiones: any[] = [];
  comunas: any[] = [];
  comunaDisabled: boolean = true;

  // Nuevas propiedades para manejo de direcciones
  direccionesUsuario: Direccion[] = [];
  direccionSeleccionada: string = ''; // 'nueva' o id de dirección existente
  mostrarFormularioDireccion: boolean = false;
  telefonoModificado: boolean = false;

  constructor(
    private compraService: CompraService,
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router,
    private regionComunaService: RegionComunaService,
    private pedidoService: PedidoService
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
    this.cargarRegiones();
  }

  cargarRegiones() {
    this.regionComunaService.getRegiones().subscribe({
      next: (regiones) => {
        this.regiones = regiones;
      },
      error: (err) => {
        console.error('Error cargando regiones', err);
        this.regiones = [];
      }
    });
  }

  onRegionChange() {
    if (this.datosCliente.region) {
      this.comunaDisabled = true;
      this.comunas = [];
      this.regionComunaService.getComunasPorRegion(Number(this.datosCliente.region)).subscribe({
        next: (comunas) => {
          this.comunas = comunas;
          this.comunaDisabled = false;
        },
        error: (err) => {
          console.error('Error cargando comunas', err);
          this.comunas = [];
          this.comunaDisabled = true;
        }
      });
    } else {
      this.comunas = [];
      this.comunaDisabled = true;
      this.datosCliente.comuna = '';
    }
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
    // Limpiar solo los campos que no son del usuario
    this.datosCliente.telefono = '';
    this.datosCliente.calle = '';
    this.datosCliente.numero = '';
    this.datosCliente.comuna = '';
    this.datosCliente.region = '';
    this.comunas = [];
    this.comunaDisabled = true;
    this.tipoDespacho = 'domicilio';
    this.cantidad = 1;
    this.paso = 1;
    this.datosUsuarioPrecompletados = false; // Resetear bandera
  }

  // Método para limpiar completamente el formulario (incluye datos del usuario)
  limpiarFormularioCompleto() {
    this.datosCliente = {
      nombre: '',
      email: '',
      telefono: '',
      calle: '',
      numero: '',
      comuna: '',
      region: ''
    };
    this.tipoDespacho = 'domicilio';
    this.cantidad = 1;
    this.paso = 1;
    this.datosUsuarioPrecompletados = false; // Resetear bandera
    this.comunas = [];
    this.comunaDisabled = true;
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
    // Validar si el usuario está autenticado antes de continuar
    if (!this.authService.isAuthenticated()) {
      this.mostrarModalRegistro();
      return;
    }

    // Pre-completar datos del usuario logueado
    this.precompletarDatosUsuario();

    // Si está autenticado, continúa al paso 2
    this.paso = 2;
  }

  // Pre-completar formulario con datos del usuario logueado
  private precompletarDatosUsuario() {
    const usuario = this.authService.getCurrentUser();
    if (usuario) {
      console.log('=== PRE-COMPLETANDO DATOS DEL USUARIO ===');
      console.log('Usuario logueado:', usuario);

      // Pre-completar nombre y email del usuario logueado
      this.datosCliente.nombre = usuario.nombre || '';
      this.datosCliente.email = usuario.email || '';
      this.datosUsuarioPrecompletados = true;

      // Manejar teléfono
      if (usuario.telefono) {
        this.datosCliente.telefono = usuario.telefono;
      }

      // Manejar direcciones
      if (usuario.direcciones && usuario.direcciones.length > 0) {
        this.direccionesUsuario = usuario.direcciones;
        // Seleccionar la dirección principal por defecto, o la primera
        const direccionPrincipal = usuario.direcciones.find(d => d.esPrincipal) || usuario.direcciones[0];
        this.direccionSeleccionada = direccionPrincipal.id?.toString() || '';
        this.aplicarDireccionSeleccionada();
      } else {
        // No tiene direcciones, mostrar formulario manual
        this.direccionSeleccionada = 'nueva';
        this.mostrarFormularioDireccion = true;
      }

      console.log('Teléfono pre-completado:', this.datosCliente.telefono);
      console.log('Direcciones disponibles:', this.direccionesUsuario.length);
      console.log('datosUsuarioPrecompletados:', this.datosUsuarioPrecompletados);
      console.log('=========================================');

      // Mantener otros campos vacíos para que el usuario los complete
      // this.datosCliente.telefono permanece vacío
      // this.datosCliente.calle permanece vacío
      // this.datosCliente.numero permanece vacío
      // this.datosCliente.comuna permanece vacío
      // this.datosCliente.region permanece vacío
    } else {
      console.log('No hay usuario logueado para pre-completar datos');
    }
  }

  // Aplicar dirección seleccionada al formulario
  aplicarDireccionSeleccionada() {
    if (this.direccionSeleccionada === 'nueva') {
      this.mostrarFormularioDireccion = true;
      this.limpiarCamposDireccion();
    } else {
      this.mostrarFormularioDireccion = false;
      const direccion = this.direccionesUsuario.find(d => d.id?.toString() === this.direccionSeleccionada);
      if (direccion) {
        this.datosCliente.calle = direccion.calle;
        this.datosCliente.numero = direccion.numero;

        // Manejar comuna (puede ser string o objeto)
        if (typeof direccion.comuna === 'string') {
          this.datosCliente.comuna = direccion.comuna;
        } else {
          this.datosCliente.comuna = direccion.comuna.id.toString();
        }

        // Manejar región (puede ser string o objeto)
        if (typeof direccion.region === 'string') {
          this.datosCliente.region = direccion.region;
        } else {
          this.datosCliente.region = direccion.region.id.toString();
          // Cargar comunas si tenemos el ID de región
          this.onRegionChange();
        }
      }
    }
  }

  // Limpiar campos de dirección manual
  limpiarCamposDireccion() {
    this.datosCliente.calle = '';
    this.datosCliente.numero = '';
    this.datosCliente.comuna = '';
    this.datosCliente.region = '';
    this.comunas = [];
    this.comunaDisabled = true;
  }

  // Evento cuando cambia la selección de dirección
  onDireccionChange() {
    this.aplicarDireccionSeleccionada();
  }

  // Marcar que el teléfono fue modificado
  onTelefonoChange() {
    this.telefonoModificado = true;
  }

  // Helper para mostrar nombre de comuna
  getComunaNombre(comuna: string | { id: number; nombre: string }): string {
    return typeof comuna === 'string' ? comuna : comuna.nombre;
  }

  // Helper para mostrar nombre de región
  getRegionNombre(region: string | { id: number; nombre: string }): string {
    return typeof region === 'string' ? region : region.nombre;
  }

  // Helper para obtener nombre de región por ID
  getRegionNombrePorId(regionId: string): string {
    if (!regionId || !this.regiones) return '';
    const region = this.regiones.find(r => r.id.toString() === regionId);
    return region ? region.nombre : regionId;
  }

  // Helper para obtener nombre de comuna por ID
  getComunaNombrePorId(comunaId: string): string {
    if (!comunaId || !this.comunas) return '';
    const comuna = this.comunas.find(c => c.id.toString() === comunaId);
    return comuna ? comuna.nombre : comunaId;
  }

  continuarPaso3() {
    if (this.validarDatosCliente()) {
      // Actualizar datos del usuario si es necesario antes de continuar
      this.actualizarDatosUsuario().then(() => {
        // Mostrar todos los datos del formulario en la consola
        console.log('=== DATOS DE ENTREGA CAPTURADOS ===');
        console.log('Nombre completo:', this.datosCliente.nombre);
        console.log('Email:', this.datosCliente.email);
        console.log('Teléfono:', this.datosCliente.telefono);
        console.log('Región:', this.datosCliente.region);
        console.log('Comuna:', this.datosCliente.comuna);
        console.log('Calle:', this.datosCliente.calle);
        console.log('Número:', this.datosCliente.numero);
        console.log('Dirección completa:', `${this.datosCliente.calle} ${this.datosCliente.numero}, ${this.datosCliente.comuna}, ${this.datosCliente.region}`);
        console.log('Tipo de despacho:', this.tipoDespacho);
        console.log('Costo de despacho:', this.costoDespacho);
        console.log('Datos pre-completados del usuario:', this.datosUsuarioPrecompletados);
        console.log('Objeto completo datosCliente:', this.datosCliente);
        console.log('=====================================');

        this.compraService.actualizarDatosCliente(this.datosCliente);
        this.compraService.actualizarTipoDespacho(this.tipoDespacho);
        this.paso = 3;
      }).catch(error => {
        console.error('Error actualizando datos del usuario:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron actualizar los datos. Inténtelo nuevamente.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
      });
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

  // Actualizar datos del usuario en el backend si es necesario
  private async actualizarDatosUsuario(): Promise<void> {
    const usuario = this.authService.getCurrentUser();
    if (!usuario) return;

    try {
      // 1. Actualizar teléfono si fue modificado o es nuevo
      if (this.telefonoModificado || !usuario.telefono) {
        await this.authService.updateDatosAdicionales({
          telefono: this.datosCliente.telefono
        }).toPromise();
      }

      // 2. Agregar nueva dirección si es necesario
      if (this.direccionSeleccionada === 'nueva' && this.mostrarFormularioDireccion) {
        // Obtener objetos completos de región y comuna
        const regionCompleta = this.regiones.find(r => r.id.toString() === this.datosCliente.region);
        const comunaCompleta = this.comunas.find(c => c.id.toString() === this.datosCliente.comuna);

        if (!regionCompleta || !comunaCompleta) {
          throw new Error('Región o comuna no encontrada');
        }

        const nuevaDireccion = {
          calle: this.datosCliente.calle,
          numero: this.datosCliente.numero,
          region: regionCompleta, // Objeto Region completo
          comuna: comunaCompleta  // Objeto Comuna completo
        };

        console.log('Creando nueva dirección:', nuevaDireccion);
        await this.authService.addDireccion(nuevaDireccion).toPromise();

        // Recargar direcciones del usuario después de agregar la nueva
        const direccionesActualizadas = await this.authService.getDireccionesUsuario().toPromise();
        const usuarioActualizado = { ...usuario, direcciones: direccionesActualizadas };
        localStorage.setItem('ferremas_user', JSON.stringify(usuarioActualizado));
        this.direccionesUsuario = direccionesActualizadas || [];
      }
    } catch (error) {
      console.error('Error detallado:', error);
      throw new Error('Error actualizando datos del usuario');
    }
  }

  // Mostrar modal invitando al usuario a registrarse
  private mostrarModalRegistro() {
    Swal.fire({
      title: 'Inicia sesión para continuar',
      text: 'Para continuar con tu compra necesitas tener una cuenta en Ferremas',
      icon: 'info',
      showCancelButton: true,
      showDenyButton: false,
      confirmButtonText: 'Iniciar sesión',
      cancelButtonText: 'Registrarse',
      reverseButtons: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      customClass: {
        container: 'swal-auth-modal',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary'
      }
    }).then((result) => {
      // Cerrar el modal de compra primero
      this.cerrarModal();

      if (result.isConfirmed) {
        // Usuario quiere iniciar sesión
        this.router.navigate(['/login']);
      } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
        // Usuario quiere registrarse
        this.router.navigate(['/registro']);
      }
    });
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

  async onPagoCompletado(exito: boolean) {
    if (exito) {
      try {
        // Crear el pedido en el backend
        await this.crearPedidoEnBackend();

        // Si la compra es desde el carrito, vaciarlo completamente (UI + storage)
        const compra = this.compraService.getCompraActual();
        if (compra?.esCompraCarrito) {
          const usuario = this.authService.getCurrentUser();
          this.carritoService.vaciarCarrito(usuario); // Pasar usuario para limpiar storage específico
        }

        // Mostrar alerta de éxito y cerrar modal en el callback
        this.mostrarAlertaExito();
      } catch (error) {
        console.error('Error creando pedido:', error);
        // Mostrar error pero no fallar el pago
        Swal.fire({
          title: 'Pago procesado',
          text: 'Su pago fue exitoso, pero hubo un problema registrando el pedido. Por favor contacte al soporte.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#ffc107'
        }).then(() => {
          // Vaciar carrito y continuar
          const compra = this.compraService.getCompraActual();
          if (compra?.esCompraCarrito) {
            const usuario = this.authService.getCurrentUser();
            this.carritoService.vaciarCarrito(usuario);
          }
          this.mostrarAlertaExito();
        });
      }
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

  /**
   * Crea el pedido en el backend después de un pago exitoso
   */
  private async crearPedidoEnBackend(): Promise<void> {
    const usuario = this.authService.getCurrentUser();
    const compra = this.compraService.getCompraActual();

    if (!usuario || !compra) {
      throw new Error('Usuario o compra no disponible');
    }

    let direccionId: number;
    if (this.direccionSeleccionada === 'nueva') {
      const direccionesActualizadas = await this.authService.getDireccionesUsuario().toPromise();
      if (!direccionesActualizadas || direccionesActualizadas.length === 0) {
        throw new Error('No se pudo obtener la dirección recién creada');
      }
      direccionId = direccionesActualizadas[direccionesActualizadas.length - 1].id;
    } else {
      direccionId = parseInt(this.direccionSeleccionada);
    }

    // Mapear productos de la compra a items del pedido (formato backend)
    const items: ItemPedidoBackend[] = compra.productos.map(item => ({
      producto: { id: item.producto.id },
      cantidad: item.cantidad,
      precioUnitario: item.producto.precios[0].precio,
      nombreProducto: item.producto.nombre // <-- requerido por backend
    }));

    const tipoEnvioBackend = this.mapearTipoEnvio(this.tipoDespacho);

    const pedidoRequest: CrearPedidoRequestBackend = {
      usuario: { id: usuario.id },
      direccionEntrega: { id: direccionId }, // <-- este es el campo correcto
      tipoEnvio: tipoEnvioBackend,
      numeroOrden: this.numeroOrden,
      items: items
    };

    console.log('Creando pedido (formato backend):', pedidoRequest);

    await this.pedidoService.crearPedido(pedidoRequest).toPromise();

    console.log('Pedido creado exitosamente');
  }

  /**
   * Mapea el tipo de despacho del frontend al valor esperado por el backend
   */
  private mapearTipoEnvio(tipoDespacho: string): string {
    switch (tipoDespacho) {
      case 'domicilio':
        return 'DOMICILIO';
      case 'retiro':
        return 'RETIRO_TIENDA';
      default:
        return 'DOMICILIO'; // Valor por defecto
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
      this.datosCliente.calle.trim() !== '' &&
      this.datosCliente.numero.trim() !== '' &&
      this.datosCliente.comuna.trim() !== '' &&
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
    // Vacía el carrito y limpia la compra actual - pasar usuario para limpiar storage específico
    const usuario = this.authService.getCurrentUser();
    this.carritoService.vaciarCarrito(usuario);
    this.compraService.limpiarCompra();
  }
}