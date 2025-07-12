import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PedidoService } from '../../services/pedido.service';
import { ConversorPipe } from '../../pipes/conversor.pipe';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, ConversorPipe],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {
  pedidos: any[] = [];
  isLoading: boolean = true;
  error: string = '';

  // Paginación
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
        // Ordenar por fecha más reciente primero
        this.pedidos = data.sort((a, b) => {
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

  prepararPedido(pedido: any) {
    const estadoAnterior = pedido.estado;
    this.pedidoService.actualizarEstadoPedido(pedido.id, 'EN_PREPARACION').subscribe({
      next: () => {
        pedido.estado = 'EN_PREPARACION';
      },
      error: () => {
        pedido.estado = estadoAnterior;
        alert('Error al actualizar el estado del pedido');
      }
    });
  }

  cancelarPedido(pedido: any) {
    const estadoAnterior = pedido.estado;
    this.pedidoService.actualizarEstadoPedido(pedido.id, 'CANCELADO').subscribe({
      next: () => {
        pedido.estado = 'CANCELADO';
      },
      error: () => {
        pedido.estado = estadoAnterior;
        alert('Error al cancelar el pedido');
      }
    });
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
}
