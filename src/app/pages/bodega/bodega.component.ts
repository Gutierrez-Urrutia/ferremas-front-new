import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PedidoService } from '../../services/pedido.service';
import { ConversorPipe } from '../../pipes/conversor.pipe';

@Component({
  selector: 'app-bodega',
  standalone: true,
  imports: [CommonModule, DatePipe, ConversorPipe],
  templateUrl: './bodega.component.html',
  styleUrl: './bodega.component.css'
})
export class BodegaComponent implements OnInit {
  pedidos: any[] = [];
  isLoading: boolean = true;
  error: string = '';

  currentPage: number = 1;
  pageSize: number = 10;
  get totalPages(): number {
    return Math.ceil(this.pedidos.length / this.pageSize);
  }
  get pagedPedidos(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.pedidos.slice(start, start + this.pageSize);
  }

  constructor(private http: HttpClient, private pedidoService: PedidoService) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8090/api/v1/pedidos').subscribe({
      next: (data) => {
        // Filtrar pedidos en preparación, despachados y entregados, luego ordenar por fecha más reciente primero
        const pedidosFiltrados = data.filter(p => p.estado === 'EN_PREPARACION' || p.estado === 'DESPACHADO' || p.estado === 'ENTREGADO');
        this.pedidos = pedidosFiltrados.sort((a, b) => {
          const fechaA = new Date(a.fechaCreacion);
          const fechaB = new Date(b.fechaCreacion);
          return fechaB.getTime() - fechaA.getTime(); // Orden descendente (más reciente primero)
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error cargando pedidos';
        this.isLoading = false;
      }
    });
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  traducirEstado(estado: string): string {
    if (!estado) return '';
    const estadosMap: { [key: string]: string } = {
      PENDIENTE: 'Pendiente',
      CONFIRMADO: 'Confirmado',
      EN_PREPARACION: 'En Preparación',
      DESPACHADO: 'Despachado',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado'
    };
    return estadosMap[estado] || estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase().toLowerCase());
  }

  obtenerClaseEstado(estado: string): string {
    const clasesMap: { [key: string]: string } = {
      PENDIENTE: 'badge bg-warning text-dark',
      CONFIRMADO: 'badge bg-info text-white',
      EN_PREPARACION: 'badge bg-warning text-dark',
      DESPACHADO: 'badge bg-warning text-dark',
      ENTREGADO: 'badge bg-success text-white',
      CANCELADO: 'badge bg-danger text-white'
    };
    return clasesMap[estado] || 'badge bg-secondary text-white';
  }

  marcarComoListo(pedido: any) {
    const estadoAnterior = pedido.estado;
    console.log('=== INICIANDO DESPACHO DE PEDIDO ===');
    console.log('ID del pedido:', pedido.id);
    console.log('Estado actual del pedido:', pedido.estado);
    console.log('Pedido completo antes de actualizar:', pedido);
    
    this.pedidoService.actualizarEstadoPedido(pedido.id, 'DESPACHADO').subscribe({
      next: (response) => {
        console.log('=== DESPACHO EXITOSO ===');
        console.log('Respuesta del servidor:', response);
        pedido.estado = 'DESPACHADO';
        console.log('Estado actualizado en la vista a:', pedido.estado);
      },
      error: (error) => {
        console.error('=== ERROR EN DESPACHO ===');
        console.error('Error completo:', error);
        console.error('Status:', error.status);
        console.error('Error body:', error.error);
        console.error('Error message:', error.message);
        pedido.estado = estadoAnterior;
        
        let mensajeError = 'Error desconocido';
        if (error.error && typeof error.error === 'string') {
          mensajeError = error.error;
        } else if (error.error && error.error.message) {
          mensajeError = error.error.message;
        } else if (error.message) {
          mensajeError = error.message;
        }
        
        alert('Error al despachar el pedido: ' + mensajeError);
      }
    });
  }

  confirmarRecepcion(pedido: any) {
    const estadoAnterior = pedido.estado;
    console.log('=== CONFIRMANDO RECEPCIÓN ===');
    console.log('ID del pedido:', pedido.id);
    console.log('Estado actual:', pedido.estado);
    
    this.pedidoService.actualizarEstadoPedido(pedido.id, 'ENTREGADO').subscribe({
      next: (response) => {
        console.log('=== RECEPCIÓN CONFIRMADA ===');
        console.log('Respuesta del servidor:', response);
        pedido.estado = 'ENTREGADO';
        alert('Pedido marcado como entregado exitosamente');
      },
      error: (error) => {
        console.error('=== ERROR EN CONFIRMACIÓN ===');
        console.error('Error completo:', error);
        pedido.estado = estadoAnterior;
        
        let mensajeError = 'Error desconocido';
        if (error.error && typeof error.error === 'string') {
          mensajeError = error.error;
        } else if (error.error && error.error.message) {
          mensajeError = error.error.message;
        } else if (error.message) {
          mensajeError = error.message;
        }
        
        alert('Error al confirmar recepción: ' + mensajeError);
      }
    });
  }
}
