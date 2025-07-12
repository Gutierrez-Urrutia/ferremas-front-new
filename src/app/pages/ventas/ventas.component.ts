import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule],
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
        this.pedidos = data;
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
    this.http.patch(`http://localhost:8090/api/v1/pedidos/${pedido.id}`, { estado: 'EN_PREPARACION' }).subscribe({
      next: () => {
        pedido.estado = 'En Preparación';
      },
      error: () => {
        pedido.estado = estadoAnterior;
        alert('Error al actualizar el estado del pedido');
      }
    });
  }

  cancelarPedido(pedido: any) {
    const estadoAnterior = pedido.estado;
    this.http.patch(`http://localhost:8090/api/v1/pedidos/${pedido.id}`, { estado: 'CANCELADO' }).subscribe({
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
      EN_CAMINO: 'En Camino',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado'
    };
    return estadosMap[estado] || estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase().toLowerCase());
  }
}
